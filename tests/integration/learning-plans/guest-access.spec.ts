import { test, expect } from '@playwright/test';

const LP_URL = '/learning-plans/the-rescuer-powerful-lessons-in-surah-al-mulk';
const FIRST_LESSON_URL = `${LP_URL}/lessons/the-king-of-all-kings`;
const STORAGE_KEY = 'guestEnrolledCourses';

const clearState = async (context, page) => {
  await context.clearCookies();
  await page.goto(LP_URL);
  await page.evaluate(() => localStorage.clear());
};

const enrollGuest = async (page) => {
  await page
    .getByRole('button', { name: /enroll/i })
    .first()
    .click();
  await page.waitForURL(/\/learning-plans\/.*\/lessons\/.+/);
};

const enrollAndReturn = async (page) => {
  await enrollGuest(page);
  await page.goto(LP_URL);
  await page.waitForLoadState('networkidle');
};

const getStoredCourses = (page) =>
  page.evaluate((key) => JSON.parse(localStorage.getItem(key) || '[]'), STORAGE_KEY);

const setupNonEnrolled = async (page) => {
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
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('/lessons/');
  });
});

test.describe('Login Redirects', () => {
  test.beforeEach(async ({ page, context }) => clearState(context, page));

  test('should redirect to login on mark complete', async ({ page }) => {
    await enrollGuest(page);
    const markComplete = page.getByRole('button', { name: /mark.complete/i });
    if ((await markComplete.count()) > 0) {
      await markComplete.click();
      await page.waitForTimeout(1000);
      expect(page.url()).toMatch(/\/(login|signup)/);
    }
  });

  test('should redirect to login on add feedback', async ({ page }) => {
    await enrollAndReturn(page);
    const feedback = page.getByRole('button', { name: /add.feedback/i });
    await expect(feedback).toBeVisible();
    await feedback.click();
    await expect(page).toHaveURL(/\/(login|signup)/);
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
    const syllabusButton = page
      .locator('button[type="button"]')
      .filter({ hasText: /day/i })
      .first();
    if ((await syllabusButton.count()) > 0) {
      await syllabusButton.click();
      await page.waitForTimeout(1000);
      await expect(page.locator('text=You are not enrolled')).toBeVisible({ timeout: 5000 });
    }
  });
});
