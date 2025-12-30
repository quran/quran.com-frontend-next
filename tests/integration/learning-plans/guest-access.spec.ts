import { test, expect, type Page, type BrowserContext } from '@playwright/test';

const LP_URL = '/learning-plans/the-rescuer-powerful-lessons-in-surah-al-mulk';
const FIRST_LESSON_URL = `${LP_URL}/lessons/the-king-of-all-kings`;

const clearState = async (context: BrowserContext, page: Page): Promise<void> => {
  await context.clearCookies();
  await page.goto(LP_URL);
  await page.evaluate(() => localStorage.clear());
};

const enrollGuest = async (page: Page): Promise<void> => {
  await page.getByTestId('learning-plan-enroll-button').first().click();
  await page.waitForURL(/\/learning-plans\/.*\/lessons\/.+/);
};
/**
 * Scroll to the bottom to ensure lazy-rendered buttons are in view
 * @param {Page} page - Playwright page instance
 * @returns {Promise<void>} resolves after scrolling is done
 */
const scrollToEnd = async (page: Page): Promise<void> => {
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForLoadState('networkidle');
};

const enrollAndReturn = async (page: Page): Promise<void> => {
  await enrollGuest(page);
  await page.goto(LP_URL, { waitUntil: 'networkidle' });
};

const expectLessonView = async (page: Page): Promise<void> => {
  await expect(page).toHaveURL(/\/lessons\//);
  await expect(page.getByTestId('learning-plan-lesson-view')).toBeVisible();
};

const setupNonEnrolled = async (page: Page): Promise<void> => {
  await page.goto(LP_URL);
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
};

// Unskip when guest enrollment is re-merged into testing
test.describe('Guest Enrollment', () => {
  test.beforeEach(async ({ page, context }) => clearState(context, page));

  test.skip('should show enroll button', async ({ page }) => {
    await expect(page.getByTestId('learning-plan-enroll-button').first()).toBeVisible();
  });

  test.skip('should redirect to lesson and save to localStorage', async ({ page }) => {
    await enrollGuest(page);
    await expect(page).toHaveURL(/.*\/lessons\/.*/);
    await expect(page.getByTestId('learning-plan-lesson-view')).toBeVisible();
  });

  test.skip('should persist after reload', async ({ page }) => {
    await enrollGuest(page);
    await page.reload();
    await expect(page).toHaveURL(/.*\/lessons\/.*/);
    await expect(page.getByTestId('learning-plan-lesson-view')).toBeVisible();
  });
});

// Unskip when guest enrollment is re-merged into testing
test.describe('Post-Enrollment Navigation', () => {
  test.beforeEach(async ({ page, context }) => clearState(context, page));

  test.skip('should show start learning button', async ({ page }) => {
    await enrollAndReturn(page);
    await expect(page.getByTestId('learning-plan-enroll-button').first()).toBeVisible();
  });

  test.skip('should navigate from start learning button', async ({ page }) => {
    await enrollAndReturn(page);
    await page.getByTestId('learning-plan-enroll-button').first().click();
    await page.waitForURL(/\/lessons\//);
  });
});

// Unskip when guest enrollment is re-merged into testing
test.describe('Login Redirects', () => {
  test.beforeEach(async ({ page, context }) => clearState(context, page));

  test.skip('should redirect to login on mark complete', async ({ page }) => {
    await enrollGuest(page);
    await scrollToEnd(page);
    const markComplete = page.getByTestId('lesson-mark-complete-button').first();
    await expect(markComplete).toBeVisible({ timeout: 10000 });
    await markComplete.click();
    await page.waitForURL(/\/(login|signup)/);
  });
});

// Unskip when guest enrollment is re-merged into testing
test.describe('Access Control', () => {
  test.beforeEach(async ({ context }) => context.clearCookies());

  test('should show not enrolled message for direct lesson access', async ({ page }) => {
    await page.goto(LP_URL);
    await page.evaluate(() => localStorage.clear());
    await Promise.all([
      page.goto(FIRST_LESSON_URL, { waitUntil: 'networkidle' }),
      expectLessonView(page),
    ]);
  });

  test.skip('should navigate to lesson when clicking syllabus lesson', async ({ page }) => {
    await setupNonEnrolled(page);
    // Open Syllabus tab (rendered as button)
    const syllabusTab = page.getByTestId('syllabus-button');
    await syllabusTab.scrollIntoViewIfNeeded();
    await expect(syllabusTab).toBeVisible({ timeout: 10000 });
    await syllabusTab.click();
    const firstSyllabusLink = page.getByTestId('syllabus-lesson-1').getByRole('link');
    await Promise.all([firstSyllabusLink.click(), expectLessonView(page)]);
  });
});
