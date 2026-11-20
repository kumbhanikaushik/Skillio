import { expect, test } from '@playwright/test';

import { auditLayout } from './layoutAudit';

/**
 * Runs on every device in playwright.config.ts (280px foldable → desktop).
 * Each state is audited for overflow, truncation, clipping and overlapping text,
 * and a screenshot is saved per device for visual review.
 */
const STATES = ['classSoon', 'noClassDone', 'live', 'newStudent', 'noLessons', 'noSubscription', 'expired'];

const settle = (ms = 1500) => new Promise((r) => setTimeout(r, ms)); // entrance + ring/bar animations

for (const state of STATES) {
  test(`home "${state}" has no layout issues`, async ({ page }, info) => {
    await page.goto(`/?state=${state}`);
    await page.getByTestId('home-screen').waitFor();
    await settle();
    await page.screenshot({ path: `e2e/device-shots/${info.project.name}/${state}.png` });
    expect(await auditLayout(page, '[data-testid="home-screen"]')).toEqual([]);
  });
}

test('results sheet has no layout issues', async ({ page }, info) => {
  await page.goto('/?state=noClassDone');
  await page.getByTestId('view-results').click();
  await page.getByTestId('results-sheet').waitFor();
  await settle(900);
  await page.screenshot({ path: `e2e/device-shots/${info.project.name}/results-sheet.png` });
  expect(await auditLayout(page, '[data-testid="results-sheet"]')).toEqual([]);
});

test('dev state sheet has no layout issues', async ({ page }, info) => {
  await page.goto('/?state=classSoon');
  await page.getByTestId('dev-switcher').click();
  await page.getByTestId('state-sheet').waitFor();
  await settle(700);
  await page.screenshot({ path: `e2e/device-shots/${info.project.name}/state-sheet.png` });
  expect(await auditLayout(page, '[data-testid="state-sheet"]')).toEqual([]);
});

test('practice screen has no layout issues', async ({ page }, info) => {
  await page.goto('/?state=classSoon');
  await page.getByTestId('start-practice').click();
  await page.getByTestId('option-2').click(); // wrong answer → longest feedback text
  await settle(700);
  await page.screenshot({ path: `e2e/device-shots/${info.project.name}/practice.png` });
  expect(await auditLayout(page, '[data-testid="practice-screen"]')).toEqual([]);
});

test('content stays readable width on large screens', async ({ page }) => {
  await page.goto('/?state=classSoon');
  const box = await page.getByTestId('journey-hero').boundingBox();
  const vw = page.viewportSize()!.width;
  expect(box!.width).toBeLessThanOrEqual(Math.min(vw, 480)); // capped + centred, never stretched
  expect(Math.abs(box!.x + box!.width / 2 - vw / 2)).toBeLessThan(2);
});
