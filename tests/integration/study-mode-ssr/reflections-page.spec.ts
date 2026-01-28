import { test, expect } from '@playwright/test';

import StudyModePage from '@/tests/POM/study-mode-page';
import { TestId } from '@/tests/test-ids';

let studyModePage: StudyModePage;

test.describe('Reflections Page SSR', () => {
  test.beforeEach(async ({ page, context }) => {
    studyModePage = new StudyModePage(page, context);
  });

  test(
    'Modal is visible on direct URL navigation',
    { tag: ['@study-mode', '@reflections', '@ssr', '@smoke'] },
    async () => {
      await studyModePage.goToReflectionsPage('1:3');

      await expect(studyModePage.modal).toBeVisible();
      await expect(studyModePage.header).toBeVisible();
    },
  );

  test(
    'Reflections content is displayed',
    { tag: ['@study-mode', '@reflections', '@ssr'] },
    async ({ page }) => {
      await studyModePage.goToReflectionsPage('1:3');
      await studyModePage.waitForContent();

      await expect(studyModePage.content).toBeVisible();

      const reflectionsTab = page.getByTestId(TestId.STUDY_MODE_TAB_REFLECTIONS);
      await expect(reflectionsTab).toBeVisible();
    },
  );

  test(
    'URL updates when navigating verses',
    { tag: ['@study-mode', '@reflections', '@ssr'] },
    async () => {
      await studyModePage.goToReflectionsPage('1:3');
      await studyModePage.waitForContent();

      await studyModePage.clickNextVerse();
      await studyModePage.waitForUrlContains('1:4');
    },
  );

  test(
    'Can navigate to reflections for different chapters',
    { tag: ['@study-mode', '@reflections', '@ssr'] },
    async ({ page }) => {
      await studyModePage.goToReflectionsPage('1:3');
      await studyModePage.waitForContent();

      await expect(studyModePage.content).toBeVisible();
      expect(page.url()).toContain('1:3');
    },
  );
});
