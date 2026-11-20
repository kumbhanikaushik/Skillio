import { expect, test, type AndroidDevice } from '@playwright/test';

import { connect, launch, screenshot, screenSize, setSystemAnimations, swipeUp } from './device';
import { auditNative, dumpHierarchy, tap, waitFor, waitGone, type Match } from './nativeAudit';

/**
 * Live tests of the real native app on running Android emulators (one Playwright project per emulator).
 * Everything goes through adb (UiAutomator hierarchy dumps + real `input` touches) via Playwright's `_android`
 * device handle. Playwright's own UI driver is deliberately not used: it goes stale after the app is relaunched.
 */
let device: AndroidDevice;
let width = 0;
const shots = () => `e2e/device-shots/native-${test.info().project.name}`;

test.beforeAll(async () => {
  device = await connect(test.info().project.metadata.serial as string);
  ({ width } = await screenSize(device));
  await setSystemAnimations(device, false);
});
test.afterAll(async () => {
  await device?.shell('settings put system font_scale 1.0');
  if (device) await setSystemAnimations(device, true);
  await device?.close();
});

/** Audits the whole scrollable screen: dump → audit → scroll, until the content stops moving. */
async function auditWholeScreen(name: string) {
  const issues = new Set<string>();
  let last = '';
  for (let page = 0; page < 6; page++) {
    const nodes = await dumpHierarchy(device);
    if (page === 0) await screenshot(device, `${shots()}/${name}.png`);
    auditNative(nodes, width).forEach((i) => issues.add(i));
    const signature = nodes.map((n) => n.text + n.box.y1).join('|');
    if (signature === last) break;
    last = signature;
    await swipeUp(device);
    await new Promise((r) => setTimeout(r, 700));
  }
  return [...issues];
}

const settle = (ms = 2500) => new Promise((r) => setTimeout(r, ms));

for (const state of ['classSoon', 'noClassDone', 'live', 'newStudent', 'noLessons', 'noSubscription', 'expired']) {
  test(`layout: home "${state}"`, async () => {
    await launch(device, `?state=${state}`);
    await settle();
    expect(await auditWholeScreen(state)).toEqual([]);
  });
}

test('layout: practice screen', async () => {
  await launch(device, 'practice');
  await settle();
  expect(await auditWholeScreen('practice')).toEqual([]);
});

test('layout: large system font (accessibility) does not break the layout', async () => {
  test.setTimeout(600_000);
  await device.shell('settings put system font_scale 1.3');
  try {
    for (const state of ['classSoon', 'noClassDone', 'live', 'newStudent', 'noLessons', 'noSubscription', 'expired', 'practice']) {
      await launch(device, state === 'practice' ? 'practice' : `?state=${state}`);
      await settle();
      expect(await auditWholeScreen(`font-1.3-${state}`), `font 1.3 · ${state}`).toEqual([]);
    }
  } finally {
    await device.shell('settings put system font_scale 1.0');
  }
});

// ---------- Interaction flows: real touches (adb input) + live hierarchy checks ----------

/**
 * Scrolls until the element is fully visible above the tab bar (slow drags, no fling — a fling keeps the
 * list moving and Android then treats the next tap as "stop scrolling" instead of a press).
 */
async function scrollTo(m: Match) {
  const { height } = await screenSize(device);
  for (let i = 0; i < 8; i++) {
    const nodes = await dumpHierarchy(device);
    const hit = nodes.find((n) => (!m.res || n.res === m.res) && (!m.text || (typeof m.text === 'string' ? n.text === m.text : m.text.test(n.text))));
    const tabTop = nodes.find((n) => n.res === 'tab-bar')?.box.y1 ?? height;
    if (hit && hit.box.y1 > height * 0.08 && hit.box.y2 < tabTop - 24) return hit;
    const from = hit ? Math.min((hit.box.y1 + hit.box.y2) / 2, tabTop - 10) : height * 0.7;
    await device.shell(`input swipe ${width / 2} ${Math.round(from)} ${width / 2} ${Math.round(height * 0.4)} 900`);
    await new Promise((r) => setTimeout(r, 600));
  }
  throw new Error(`could not scroll ${JSON.stringify(m)} fully into view`);
}

test('flow: countdown is on screen and readable by TalkBack', async () => {
  await launch(device, '?state=classSoon');
  await waitFor(device, { text: 'Hey Aarav!' }, 30_000);
  await waitFor(device, { desc: /^Class starts in \d+ minutes$/ });
  const nodes = await dumpHierarchy(device);
  for (const res of ['journey-hero', 'class-countdown', 'join-class']) {
    const n = nodes.find((x) => x.res === res);
    expect(n, `${res} rendered`).toBeTruthy();
    expect(n!.box.x1, `${res} left edge`).toBeGreaterThanOrEqual(0);
    expect(n!.box.x2, `${res} right edge`).toBeLessThanOrEqual(width);
  }
});

test('flow: Start practice → answer 3 → card flips to done → View results', async () => {
  await launch(device, '?state=classSoon');
  await waitFor(device, { text: 'Hey Aarav!' }, 30_000);
  await scrollTo({ res: 'start-practice' });
  await tap(device, { res: 'start-practice' }, { res: 'practice-screen' });

  for (const [i, option] of [0, 1, 0].entries()) {
    await waitFor(device, { text: new RegExp(`^Question ${i + 1} of 3`) });
    await tap(device, { res: `option-${option}` }, { res: 'feedback' });
    if (i === 2) await screenshot(device, `${shots()}/practice-feedback.png`);
    const next = i < 2 ? { text: new RegExp(`^Question ${i + 2} of 3`) } : { res: 'home-screen' };
    await tap(device, { res: 'practice-continue' }, next);
  }

  await scrollTo({ text: 'Practice done. Nice!' });
  await waitFor(device, { text: '2/3' });
  await waitFor(device, { text: /13$/ }); // streak 12 → 13 after finishing (🔥13)
  await screenshot(device, `${shots()}/practice-done.png`);

  await scrollTo({ res: 'view-results' });
  await tap(device, { res: 'view-results' }, { text: /^Today.s results/ });
  await screenshot(device, `${shots()}/results-sheet.png`);
  await tap(device, { res: 'results-done' });
  await waitGone(device, { res: 'results-sheet' });
});

test('flow: dev switcher bottom sheet swaps states live', async () => {
  await launch(device, '?state=noLessons');
  await waitFor(device, { text: 'Hey Aarav!' }, 30_000);
  await tap(device, { res: 'dev-switcher' }, { res: 'state-sheet' });
  // all 7 states visible in the grid at once
  const nodes = await dumpHierarchy(device);
  for (const s of ['classSoon', 'noClassDone', 'live', 'newStudent', 'noLessons', 'noSubscription', 'expired'])
    expect(nodes.some((n) => n.res === `state-${s}`), `state-${s} visible`).toBe(true);
  const inSheet = nodes.filter((n) => { for (let a = n.parent; a; a = a.parent) if (a.res === 'state-sheet') return true; return false; });
  expect(auditNative(inSheet, width), 'sheet layout').toEqual([]); // only the sheet — home stays behind the scrim
  await screenshot(device, `${shots()}/state-sheet.png`);

  await tap(device, { res: 'state-noSubscription' }, { text: 'FREE' }); // hero tier pill — always above the fold
  await tap(device, { res: 'dev-switcher' }, { res: 'state-sheet' });
  await tap(device, { res: 'state-live' }, { text: 'LIVE NOW' });
  await screenshot(device, `${shots()}/switched-live.png`);
});
