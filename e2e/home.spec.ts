import { expect, test, type Page } from '@playwright/test';

const id = (page: Page, testId: string) => page.getByTestId(testId);

/** Which class card each demo scenario must render. */
const SCENARIOS = {
  classSoon: 'class-card-upcoming',
  noClassDone: 'class-card-book',
  live: 'class-card-live',
  newStudent: 'class-card-book',
  noLessons: 'class-card-no-lessons',
  noSubscription: 'class-card-upsell',
  expired: 'class-card-expired',
} as const;

test.describe('Home screen', () => {
  test('renders every section for a typical student', async ({ page }) => {
    await page.goto('/');
    await expect(id(page, 'greeting-name')).toHaveText('Hey Aarav!');
    await expect(id(page, 'journey-hero')).toContainText('B1');
    await expect(id(page, 'journey-hero')).toContainText('B2');
    await expect(id(page, 'tier-pill')).toContainText('PRO');
    await expect(id(page, 'class-card-upcoming')).toContainText('Ms. Priya Shah');
    await expect(id(page, 'practice-card-todo')).toBeVisible();
    await expect(id(page, 'skills-card')).toContainText('Pronunciation');
    await expect(id(page, 'plan-card')).toContainText('7 of 12 live lessons left');
  });

  test('class countdown shows hrs · min (seconds only join in the final 10 minutes)', async ({ page }) => {
    await page.goto('/');
    const countdown = id(page, 'class-countdown');
    await expect(countdown).toContainText(/hrs/i);
    await expect(countdown).toContainText(/min/i);
    await expect(countdown).not.toContainText(/sec/i);
    await expect(countdown).toHaveAttribute('aria-label', /Class starts in \d+ minutes/);
  });

  for (const [state, card] of Object.entries(SCENARIOS)) {
    test(`scenario "${state}" shows ${card}`, async ({ page }) => {
      await page.goto(`/?state=${state}`);
      await expect(id(page, card)).toBeVisible();
    });
  }

  test('edge states explain themselves', async ({ page }) => {
    await page.goto('/?state=newStudent');
    await expect(id(page, 'skills-empty')).toContainText('3-minute check');
    await expect(id(page, 'streak-chip')).toContainText('0');

    await page.goto('/?state=expired');
    await expect(id(page, 'tier-pill')).toContainText('EXPIRED');
    await expect(id(page, 'plan-card')).toContainText('EXPIRED');

    await page.goto('/?state=noSubscription');
    await expect(id(page, 'tier-pill')).toContainText('FREE');
  });

  test('dev switcher: bottom sheet lists every state, swaps live and closes', async ({ page }) => {
    await page.goto('/');
    await id(page, 'dev-switcher').click();
    const sheet = id(page, 'state-sheet');
    await expect(sheet).toBeVisible();
    for (const s of ['classSoon', 'noClassDone', 'live', 'newStudent', 'noLessons', 'noSubscription', 'expired'])
      await expect(id(page, `state-${s}`)).toBeInViewport(); // all 7 visible, no sideways scrolling
    await id(page, 'state-noLessons').click();
    await expect(sheet).toHaveCount(0); // closes after picking
    await expect(id(page, 'class-card-no-lessons')).toBeVisible();

    await id(page, 'dev-switcher').click();
    await expect(id(page, 'state-noLessons')).toHaveCSS('background-color', 'rgb(230, 247, 249)'); // current state = teal tile
    await id(page, 'state-live').click();
    await expect(id(page, 'class-card-live')).toBeVisible();

    await id(page, 'dev-switcher').click();
    await id(page, 'state-sheet-close').click();
    await expect(sheet).toHaveCount(0);
  });
});

test.describe('Feedback & profile', () => {
  test('class buttons confirm with a toast', async ({ page }) => {
    await page.goto('/?state=noClassDone');
    await id(page, 'book-class').click();
    await expect(id(page, 'toast')).toHaveText('✅ Booked for Fri · 5:30 PM');
    await expect(id(page, 'toast')).toHaveCount(0, { timeout: 5_000 }); // auto-hides
    await page.goto('/?state=expired');
    await id(page, 'renew-plan').click();
    await expect(id(page, 'toast')).toContainText('renewed');
  });

  test('avatar shows the photo, or the initial when there is none', async ({ page }) => {
    await page.goto('/?state=classSoon');
    await expect(page.getByRole('img', { name: "Aarav's photo" })).toBeVisible();
    await page.goto('/?state=newStudent');
    await expect(page.getByRole('img', { name: "Meera's photo" })).toHaveCount(0);
    await expect(id(page, 'greeting-name')).toHaveText('Hey Meera!');
  });
});

test.describe('Daily practice loop', () => {
  test('Start → answer → finish → card flips to done → View results', async ({ page }) => {
    await page.goto('/?state=classSoon');
    await id(page, 'start-practice').click();
    await expect(id(page, 'practice-screen')).toBeVisible();

    // Correct answers: 0, 1, 2 (see features/practice/questions.ts). Miss the last one on purpose.
    for (const [i, option] of [0, 1, 0].entries()) {
      await expect(id(page, 'question-counter')).toContainText(`Question ${i + 1} of 3`);
      await id(page, `option-${option}`).click();
      await expect(id(page, 'feedback')).toBeVisible();
      await id(page, 'practice-continue').click();
    }

    await expect(id(page, 'home-screen')).toBeVisible();
    await expect(id(page, 'practice-card-done')).toBeVisible();
    await expect(id(page, 'practice-card-done')).toContainText('2/3');
    await expect(id(page, 'streak-chip')).toContainText('13');

    await id(page, 'view-results').click();
    await expect(id(page, 'results-sheet')).toBeVisible();
    await expect(id(page, 'results-sheet')).toContainText("Today's results");
    await id(page, 'results-done').click();
    await expect(id(page, 'results-sheet')).toHaveCount(0);
  });
});
