import type { AndroidDevice } from '@playwright/test';

import { PKG } from './device';

type Box = { x1: number; y1: number; x2: number; y2: number };
export type UiNode = { text: string; desc: string; res: string; pkg: string; box: Box; parent?: UiNode };

const parseBox = (s: string): Box => {
  const [x1, y1, x2, y2] = s.match(/\d+/g)!.map(Number);
  return { x1, y1, x2, y2 };
};

/**
 * Dumps the live native view hierarchy through UiAutomator (adb only — must NOT run while the
 * Playwright Android driver is attached; Android allows a single UI-automation client).
 * Retries because the dump needs ~1s of UI idle time.
 */
export async function dumpHierarchy(device: AndroidDevice, tries = 8): Promise<UiNode[]> {
  for (let i = 0; i < tries; i++) {
    const out = (await device.shell('uiautomator dump /sdcard/skillio-ui.xml')).toString();
    if (out.includes('dumped')) {
      const xml = (await device.shell('cat /sdcard/skillio-ui.xml')).toString();
      return parse(xml);
    }
    await new Promise((r) => setTimeout(r, 1200));
  }
  throw new Error('UiAutomator could not get an idle UI (something re-renders every second?)');
}

export type Match = { res?: string; text?: string | RegExp; desc?: string | RegExp };

const matches = (n: UiNode, m: Match) =>
  (!m.res || n.res === m.res) &&
  (!m.text || (typeof m.text === 'string' ? n.text === m.text : m.text.test(n.text))) &&
  (!m.desc || (typeof m.desc === 'string' ? n.desc === m.desc : m.desc.test(n.desc)));

/** Polls the live hierarchy until a node matches (by testID `res`, text or content-desc). */
export async function waitFor(device: AndroidDevice, m: Match, timeout = 20_000): Promise<UiNode> {
  const end = Date.now() + timeout;
  let seen: UiNode[] = [];
  while (Date.now() < end) {
    seen = await dumpHierarchy(device).catch(() => seen);
    const hit = seen.find((n) => matches(n, m));
    if (hit) return hit;
    await new Promise((r) => setTimeout(r, 500));
  }
  // Failure message lists what IS on screen, so a broken flow is diagnosable from the report alone.
  const onScreen = seen.filter((n) => n.pkg === PKG && (n.text || n.res)).map((n) => n.res || JSON.stringify(n.text)).slice(0, 40);
  throw new Error(`timed out after ${timeout}ms waiting for ${JSON.stringify(m, (_, v) => (v instanceof RegExp ? String(v) : v))}\non screen: ${onScreen.join(', ')}`);
}

export async function waitGone(device: AndroidDevice, m: Match, timeout = 10_000) {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    if (!(await dumpHierarchy(device)).some((n) => matches(n, m))) return;
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`still visible after ${timeout}ms: ${JSON.stringify(m)}`);
}

/**
 * Real touch (adb input) on the centre of the first matching node, once it has stopped moving
 * (on Android the first tap during a momentum scroll only stops the scroll). If `expect` is given,
 * re-taps until that appears — the way a person taps again when nothing happened. It only re-taps
 * while the target is still on screen: if the target is gone, the first tap worked (re-tapping would
 * hit whatever replaced it, e.g. the scrim that closes a sheet), so it just waits longer instead.
 */
export async function tap(device: AndroidDevice, m: Match, expect?: Match) {
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0 && !(await dumpHierarchy(device)).some((n) => matches(n, m))) return void (await waitFor(device, expect!, 20_000));
    let box = (await waitFor(device, m)).box;
    for (let i = 0; i < 5; i++) {
      await new Promise((r) => setTimeout(r, 400));
      const next = (await waitFor(device, m)).box;
      if (next.y1 === box.y1 && next.x1 === box.x1) break;
      box = next;
    }
    await device.shell(`input tap ${Math.round((box.x1 + box.x2) / 2)} ${Math.round((box.y1 + box.y2) / 2)}`);
    if (!expect) return;
    if (await waitFor(device, expect, 6_000).then(() => true, () => false)) return;
  }
  await waitFor(device, expect!, 1); // throws with the on-screen diagnostics
}

function parse(xml: string): UiNode[] {
  const nodes: UiNode[] = [];
  const stack: UiNode[] = [];
  for (const [tag] of xml.matchAll(/<\/?node\b[^>]*?\/?>/g)) {
    if (tag.startsWith('</')) {
      stack.pop();
      continue;
    }
    // uiautomator writes emoji as UTF-16 surrogate entities (&#55357;&#56613;), so decode numeric entities too
    const attr = (k: string) =>
      (new RegExp(`\\b${k}="([^"]*)"`).exec(tag)?.[1] ?? '')
        .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
        .replace(/&amp;/g, '&').replace(/&apos;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    const node: UiNode = { text: attr('text'), desc: attr('content-desc'), res: attr('resource-id'), pkg: attr('package'), box: parseBox(attr('bounds')), parent: stack.at(-1) };
    nodes.push(node);
    if (!tag.endsWith('/>')) stack.push(node);
  }
  return nodes;
}

const within = (inner: Box, outer: Box) => inner.x1 >= outer.x1 && inner.x2 <= outer.x2 && inner.y1 >= outer.y1 && inner.y2 <= outer.y2;
const intersects = (a: Box, b: Box) => Math.min(a.x2, b.x2) - Math.max(a.x1, b.x1) > 6 && Math.min(a.y2, b.y2) - Math.max(a.y1, b.y1) > 6;

/**
 * Native layout audit, same rules as the web one:
 *  - text off-screen horizontally
 *  - text sticking out of its own container
 *  - two texts overlapping (compared only inside the same region: scroll content vs. tab bar,
 *    and ignoring the dev-only state switcher which floats on purpose)
 */
export function auditNative(nodes: UiNode[], screenWidth: number): string[] {
  const app = nodes.filter((n) => n.pkg === PKG);
  const find = (res: string) => app.find((n) => n.res === res)?.box;
  const tabBar = find('tab-bar');
  const floating = [find('dev-switcher')].filter(Boolean) as Box[];

  const texts = app.filter((n) => n.text.trim() && n.box.x2 > n.box.x1 && n.box.y2 > n.box.y1);
  const label = (n: UiNode) => `"${n.text.trim().slice(0, 40)}"`;
  const issues = new Set<string>();

  for (const n of texts) {
    if (n.box.x1 < 0 || n.box.x2 > screenWidth) issues.add(`off-screen ${label(n)}`);
    const p = n.parent?.box;
    if (p && (n.box.x1 < p.x1 - 2 || n.box.x2 > p.x2 + 2)) issues.add(`overflows its container ${label(n)}`);
    // Android reports bounds already clipped by the container, so a clipped label shows up as text that
    // ends exactly on a padded container's edge (cards, pills, hero all have padding — text never touches it).
    for (let a = n.parent; a; a = a.parent) {
      if (!a.res || a.res.includes(':id/')) continue;
      // text that fills its own direct parent edge-to-edge (e.g. centred in a countdown cell) is laid out, not clipped
      const fillsParent = !!p && Math.abs(n.box.x1 - p.x1) <= 1 && Math.abs(n.box.x2 - p.x2) <= 1;
      if (fillsParent) break;
      const left = Math.abs(n.box.x1 - a.box.x1) <= 1, right = Math.abs(n.box.x2 - a.box.x2) <= 1;
      // touching exactly one edge = cut off there (stretched/centred text touches both and is fine)
      if (left !== right) issues.add(`clipped at the edge of "${a.res}" ${label(n)}`);
      break;
    }
  }

  const region = (b: Box) => (tabBar && within(b, tabBar) ? 'tabs' : tabBar && intersects(b, tabBar) ? 'under-tabs' : 'content');
  const comparable = texts.filter((n) => region(n.box) !== 'under-tabs' && !floating.some((f) => intersects(n.box, f)));
  for (let i = 0; i < comparable.length; i++)
    for (let j = i + 1; j < comparable.length; j++) {
      const a = comparable[i], b = comparable[j];
      if (region(a.box) === region(b.box) && intersects(a.box, b.box)) issues.add(`overlap ${label(a)} × ${label(b)}`);
    }
  return [...issues];
}
