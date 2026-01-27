import { test, expect } from '@playwright/test';

import StudyModePage from '@/tests/POM/study-mode-page';
import { TestId } from '@/tests/test-ids';

let studyModePage: StudyModePage;

test.describe('Answers Page SSR', () => {
  test.beforeEach(async ({ page, context }) => {
    studyModePage = new StudyModePage(page, context);
  });

  test(
    'Modal is visible on direct URL navigation',
    { tag: ['@study-mode', '@answers', '@ssr', '@smoke'] },
    async () => {
      await studyModePage.goToAnswersPage('2:6');

      await expect(studyModePage.modal).toBeVisible();
      await expect(studyModePage.header).toBeVisible();
    },
  );

  test(
    'Answers content is displayed',
    { tag: ['@study-mode', '@answers', '@ssr'] },
    async ({ page }) => {
      await studyModePage.goToAnswersPage('2:6');
      await studyModePage.waitForContent();

      await expect(studyModePage.content).toBeVisible();

      const answersTab = page.getByTestId(TestId.STUDY_MODE_TAB_ANSWERS);
      await expect(answersTab).toBeVisible();
    },
  );

  test(
    'URL updates when navigating verses',
    { tag: ['@study-mode', '@answers', '@ssr'] },
    async () => {
      await studyModePage.goToAnswersPage('2:6');
      await studyModePage.waitForContent();

      await studyModePage.clickNextVerse();
      await studyModePage.waitForUrlContains('2:7');
    },
  );

  test(
    'Can navigate to answers for different chapters',
    { tag: ['@study-mode', '@answers', '@ssr'] },
    async ({ page }) => {
      await studyModePage.goToAnswersPage('2:6');
      await studyModePage.waitForContent();

      await expect(studyModePage.content).toBeVisible();
      expect(page.url()).toContain('2:6');
    },
  );
});
