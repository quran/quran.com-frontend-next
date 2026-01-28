import { test, expect } from '@playwright/test';

import StudyModePage from '@/tests/POM/study-mode-page';
import { TestId } from '@/tests/test-ids';

let studyModePage: StudyModePage;

test.describe('Lessons Page SSR', () => {
  test.beforeEach(async ({ page, context }) => {
    studyModePage = new StudyModePage(page, context);
  });

  test(
    'Modal is visible on direct URL navigation',
    { tag: ['@study-mode', '@lessons', '@ssr', '@smoke'] },
    async () => {
      await studyModePage.goToLessonsPage('1:3');

      await expect(studyModePage.modal).toBeVisible();
      await expect(studyModePage.header).toBeVisible();
    },
  );

  test(
    'Lessons content is displayed',
    { tag: ['@study-mode', '@lessons', '@ssr'] },
    async ({ page }) => {
      await studyModePage.goToLessonsPage('1:3');
      await studyModePage.waitForContent();

      await expect(studyModePage.content).toBeVisible();

      const lessonsTab = page.getByTestId(TestId.STUDY_MODE_TAB_LESSONS);
      await expect(lessonsTab).toBeVisible();
    },
  );

  test(
    'URL updates when navigating verses',
    { tag: ['@study-mode', '@lessons', '@ssr'] },
    async () => {
      await studyModePage.goToLessonsPage('1:3');
      await studyModePage.waitForContent();

      await studyModePage.clickNextVerse();
      await studyModePage.waitForUrlContains('1:4');
    },
  );

  test(
    'Can navigate to lessons for different chapters',
    { tag: ['@study-mode', '@lessons', '@ssr'] },
    async ({ page }) => {
      await studyModePage.goToLessonsPage('1:3');
      await studyModePage.waitForContent();

      await expect(studyModePage.content).toBeVisible();
      expect(page.url()).toContain('1:3');
    },
  );
});
