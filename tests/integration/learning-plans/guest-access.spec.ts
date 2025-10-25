import { test, expect, type Page, type BrowserContext } from '@playwright/test';

const LP_URL = '/learning-plans/the-rescuer-powerful-lessons-in-surah-al-mulk';
const FIRST_LESSON_URL = `${LP_URL}/lessons/the-king-of-all-kings`;

const clearState = async (context: BrowserContext, page: Page): Promise<void> => {
  await context.clearCookies();
  await page.goto(LP_URL);
  await page.evaluate(() => localStorage.clear());
};

const enrollGuest = async (page: Page): Promise<void> => {
  await page
    .getByRole('button', { name: /enroll/i })
    .first()
    .click();
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
  await page.goto(LP_URL);
  await page.waitForLoadState('networkidle');
};

/**
 * Get enrolled courses from Redux persist storage
 * Redux persist stores data under 'persist:root' key with nested JSON structure
 * @param {Page} page - Playwright page instance
 * @returns {Promise<string[]>} resolves with the enrolled courses
 */
const getStoredCourses = (page: Page): Promise<string[]> =>
  page.evaluate(() => {
    try {
      const persistRoot = localStorage.getItem('persist:root');
      if (!persistRoot) return [];

      const rootState = JSON.parse(persistRoot);
      const guestEnrollmentState = JSON.parse(rootState.guestEnrollment || '{}');

      return guestEnrollmentState.enrolledCourses || [];
    } catch {
      return [];
    }
  });

const setupNonEnrolled = async (page: Page): Promise<void> => {
  await page.goto(LP_URL);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForLoadState('networkidle');
};

test.describe('Guest Enrollment', () => {
  test.beforeEach(async ({ page, context }) => clearState(context, page));

  test('should show enroll button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /enroll/i }).first()).toBeVisible();
  });

  test('should redirect to lesson and save to localStorage', async ({ page }) => {
    await enrollGuest(page);
    expect(page.url()).toContain('/lessons/');
    expect((await getStoredCourses(page)).length).toBeGreaterThan(0);
  });

  test('should persist after reload', async ({ page }) => {
    await enrollGuest(page);
    await page.reload();
    expect((await getStoredCourses(page)).length).toBeGreaterThan(0);
  });
});

test.describe('Post-Enrollment Navigation', () => {
  test.beforeEach(async ({ page, context }) => clearState(context, page));

  test('should show start learning button', async ({ page }) => {
    await enrollAndReturn(page);
    await expect(
      page.getByRole('button', { name: /(start|continue).learning/i }).first(),
    ).toBeVisible();
  });

  test('should navigate from start learning button', async ({ page }) => {
    await enrollAndReturn(page);
    await page
      .getByRole('button', { name: /(start|continue).learning/i })
      .first()
      .click();
    await page.waitForURL(/\/lessons\//);
  });
});

test.describe('Login Redirects', () => {
  test.beforeEach(async ({ page, context }) => clearState(context, page));

  test('should redirect to login on mark complete', async ({ page }) => {
    await enrollGuest(page);
    await scrollToEnd(page);
    const markComplete = page.getByRole('button', { name: /mark\s+as\s+completed/i }).first();
    await expect(markComplete).toBeVisible({ timeout: 10000 });
    await markComplete.click();
    await page.waitForURL(/\/(login|signup)/);
  });
});

test.describe('Access Control', () => {
  test.beforeEach(async ({ context }) => context.clearCookies());

  test('should show not enrolled message for direct lesson access', async ({ page }) => {
    await page.goto(LP_URL);
    await page.evaluate(() => localStorage.clear());
    await page.goto(FIRST_LESSON_URL);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=You are not enrolled')).toBeVisible();
  });

  test('should show toast when clicking syllabus lesson', async ({ page }) => {
    await setupNonEnrolled(page);
    // Open Syllabus tab (rendered as button)
    const syllabusTab = page.getByRole('button', { name: /syllabus/i }).first();
    await syllabusTab.scrollIntoViewIfNeeded();
    await expect(syllabusTab).toBeVisible({ timeout: 10000 });
    await syllabusTab.click();
    const firstSyllabusLink = page
      .locator('p')
      .filter({ hasText: /^\s*day\s+\d+/i })
      .locator('a')
      .first();
    await expect(firstSyllabusLink).toBeVisible({ timeout: 10000 });
    await firstSyllabusLink.click();
    await expect(page.locator('text=You are not enrolled')).toBeVisible({ timeout: 10000 });
  });
});
