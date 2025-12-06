import { test, expect, type Page, type BrowserContext } from '@playwright/test';

const LP_URL = '/learning-plans/the-rescuer-powerful-lessons-in-surah-al-mulk';

const clearState = async (context: BrowserContext, page: Page): Promise<void> => {
  await context.clearCookies();
  await page.goto(LP_URL);
  await page.evaluate(() => localStorage.clear());
};

/**
 * Click the "Start here" button and wait for navigation to lesson page
 */
const clickStartHereButton = async (page: Page): Promise<void> => {
  const startHereButton = page.getByRole('button', { name: /start\s+here/i }).first();
  await startHereButton.click();
  await page.waitForURL(/\/learning-plans\/.*\/lessons\/.+/);
};

/**
 * Click "Start here" and return to the course page
 */
const clickStartHereAndReturnToCoursePage = async (page: Page): Promise<void> => {
  await clickStartHereButton(page);
  await page.goto(LP_URL, { waitUntil: 'networkidle' });
};

/**
 * Scroll to bottom of page to ensure lazy-rendered content is visible
 */
const scrollToPageBottom = async (page: Page): Promise<void> => {
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForLoadState('networkidle');
  // Scroll twice to ensure all lazy content is loaded
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForLoadState('networkidle');
};

/**
 * Open the syllabus tab
 */
const openSyllabusTab = async (page: Page): Promise<void> => {
  const syllabusTab = page.getByRole('button', { name: /syllabus/i }).first();
  await syllabusTab.scrollIntoViewIfNeeded();
  await expect(syllabusTab).toBeVisible({ timeout: 10000 });
  await syllabusTab.click();
};

/**
 * Test Suites
 */

test.describe('Guest Access - Start Here Button', () => {
  test.beforeEach(async ({ page, context }) => {
    await clearState(context, page);
  });

  test('should display "Start here" button for guest users', async ({ page }) => {
    const startHereButton = page.getByRole('button', { name: /start\s+here/i }).first();
    await expect(startHereButton).toBeVisible();
  });

  test('should redirect guest to first lesson when clicking "Start here"', async ({ page }) => {
    await clickStartHereButton(page);

    // Verify navigation to lesson page
    await expect(page).toHaveURL(/\/lessons\//);
  });
});

test.describe('Guest User Behavior', () => {
  test.beforeEach(async ({ page, context }) => {
    await clearState(context, page);
  });

  test('should show "Start here" button after accessing a lesson', async ({ page }) => {
    // Navigate to lesson and return to course page
    await clickStartHereAndReturnToCoursePage(page);

    // Guests are not enrolled, so they should still see "Start here"
    const startHereButton = page.getByRole('button', { name: /start\s+here/i }).first();
    await expect(startHereButton).toBeVisible();
  });
});

test.describe('Guest User Limitations', () => {
  test.beforeEach(async ({ page, context }) => {
    await clearState(context, page);
  });

  test('should redirect to login when guest tries to mark lesson as complete', async ({ page }) => {
    // Navigate to lesson
    await clickStartHereButton(page);

    // Scroll to bottom to ensure mark complete button is visible
    await scrollToPageBottom(page);

    // Try to mark lesson as complete
    const markCompleteButton = page.getByRole('button', { name: /mark\s+as\s+completed/i }).first();
    await expect(markCompleteButton).toBeVisible({ timeout: 10000 });
    await markCompleteButton.click();

    // Should redirect to login or signup page
    await page.waitForURL(/\/(login|signup)/);
  });
});

test.describe('Syllabus Navigation', () => {
  test.beforeEach(async ({ page, context }) => {
    await clearState(context, page);
  });

  test('should navigate to lesson when clicking on syllabus lesson', async ({ page }) => {
    // Open syllabus tab
    await openSyllabusTab(page);

    // Click on first lesson in syllabus
    const firstLesson = page.getByText(/The King of All Kings/i).first();
    await expect(firstLesson).toBeVisible();
    await firstLesson.click();

    // Verify navigation to lesson page
    await expect(page).toHaveURL(/\/lessons\//);
  });
});
