import { test, expect } from '@playwright/test';

import StudyModePage from '@/tests/POM/study-mode-page';

let studyModePage: StudyModePage;

test.describe('Study Mode Close Behavior', () => {
  test.beforeEach(async ({ page, context }) => {
    studyModePage = new StudyModePage(page, context);
  });

  test(
    'Close button is visible',
    { tag: ['@study-mode', '@close', '@ssr', '@smoke'] },
    async () => {
      await studyModePage.goToTafsirPage('1:3');
      await studyModePage.waitForContent();

      await expect(studyModePage.closeButton).toBeVisible();
    },
  );

  test(
    'Close button navigates to chapter page',
    { tag: ['@study-mode', '@close', '@ssr'] },
    async ({ page }) => {
      await studyModePage.goToTafsirPage('1:3');
      await studyModePage.waitForContent();

      await studyModePage.clickCloseButton();

      await expect(page).toHaveURL(/\/1/, { timeout: 10000 });
    },
  );

  test(
    'Close button adds startingVerse parameter',
    { tag: ['@study-mode', '@close', '@ssr'] },
    async ({ page }) => {
      await studyModePage.goToTafsirPage('1:5');
      await studyModePage.waitForContent();

      await studyModePage.clickCloseButton();

      await expect(page).toHaveURL(/startingVerse=5/, { timeout: 10000 });
    },
  );

  test(
    'Close from lessons page works',
    { tag: ['@study-mode', '@close', '@ssr'] },
    async ({ page }) => {
      await studyModePage.goToLessonsPage('1:3');
      await expect(studyModePage.modal).toBeVisible({ timeout: 30000 });

      await expect(studyModePage.closeButton).toBeVisible({ timeout: 10000 });
      await studyModePage.clickCloseButton();

      await expect(page).toHaveURL(/startingVerse=3/, { timeout: 15000 });
    },
  );

  test(
    'Close from answers page works',
    { tag: ['@study-mode', '@close', '@ssr'] },
    async ({ page }) => {
      await studyModePage.goToAnswersPage('2:6');
      await studyModePage.waitForContent();

      await studyModePage.clickCloseButton();

      await expect(page).toHaveURL(/\/2/, { timeout: 10000 });
      await expect(page).toHaveURL(/startingVerse=6/, { timeout: 10000 });
    },
  );

  test(
    'Close after verse navigation uses updated verse',
    { tag: ['@study-mode', '@close', '@ssr'] },
    async ({ page }) => {
      await studyModePage.goToTafsirPage('1:3');
      await studyModePage.waitForContent();

      await studyModePage.clickNextVerse();
      await studyModePage.waitForUrlContains('1:4');

      await studyModePage.clickNextVerse();
      await studyModePage.waitForUrlContains('1:5');

      await studyModePage.clickCloseButton();

      await expect(page).toHaveURL(/startingVerse=5/, { timeout: 10000 });
    },
  );
});
