import { test } from '@playwright/test';

/**
 * Captures submission screenshots of every state into `screenshots/`.
 * The viewport is tall so the whole home screen fits in one image.
 */
const STATES = ['classSoon', 'noClassDone', 'live', 'newStudent', 'noLessons', 'noSubscription', 'expired'];

test.use({ viewport: { width: 390, height: 1720 } });

// The dev-only state switcher shouldn't appear in submission screenshots.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    addEventListener('DOMContentLoaded', () => {
      const s = document.createElement('style');
      s.textContent = '[data-testid="dev-switcher"]{display:none!important}';
      document.head.appendChild(s);
    });
  });
});

for (const state of STATES) {
  test(`screenshot: ${state}`, async ({ page }) => {
    await page.goto(`/?state=${state}`);
    await page.getByTestId('home-screen').waitFor();
    await page.waitForTimeout(1600); // let entrance + ring/bar animations settle
    await page.screenshot({ path: `screenshots/${state}.png` });
  });
}

test('screenshot: results sheet', async ({ page }) => {
  await page.goto('/?state=noClassDone');
  await page.getByTestId('view-results').click();
  await page.waitForTimeout(900);
  await page.screenshot({ path: 'screenshots/results-sheet.png' });
});

test('screenshot: practice session', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?state=classSoon');
  await page.getByTestId('start-practice').click();
  await page.getByTestId('option-0').click();
  await page.waitForTimeout(700);
  await page.screenshot({ path: 'screenshots/practice-session.png' });
});
