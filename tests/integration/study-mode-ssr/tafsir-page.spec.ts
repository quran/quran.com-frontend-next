import { test, expect } from '@playwright/test';

import StudyModePage from '@/tests/POM/study-mode-page';
import { TestId } from '@/tests/test-ids';

let studyModePage: StudyModePage;

test.describe('Tafsir Page SSR', () => {
  test.beforeEach(async ({ page, context }) => {
    studyModePage = new StudyModePage(page, context);
  });

  test(
    'Modal is visible on direct URL navigation',
    { tag: ['@study-mode', '@tafsir', '@ssr', '@smoke'] },
    async () => {
      await studyModePage.goToTafsirPage('1:3');

      await expect(studyModePage.modal).toBeVisible();
      await expect(studyModePage.header).toBeVisible();
    },
  );

  test(
    'Tafsir content is displayed correctly',
    { tag: ['@study-mode', '@tafsir', '@ssr'] },
    async ({ page }) => {
      await studyModePage.goToTafsirPage('1:3', 'en-tafisr-ibn-kathir');
      await studyModePage.waitForContent();

      await expect(studyModePage.content).toBeVisible();

      const tafsirTab = page.getByTestId(TestId.STUDY_MODE_TAB_TAFSIR);
      await expect(tafsirTab).toBeVisible();
    },
  );

  test(
    'Previous verse button is disabled on verse 1',
    { tag: ['@study-mode', '@tafsir', '@ssr'] },
    async () => {
      await studyModePage.goToTafsirPage('1:1');
      await studyModePage.waitForContent();

      await expect(studyModePage.prevVerseButton).toHaveAttribute('disabled', '');
    },
  );

  test(
    'Next verse button navigates to next verse',
    { tag: ['@study-mode', '@tafsir', '@ssr'] },
    async () => {
      await studyModePage.goToTafsirPage('1:3');
      await studyModePage.waitForContent();

      await expect(studyModePage.nextVerseButton).toBeEnabled();
      await studyModePage.clickNextVerse();

      await studyModePage.waitForUrlContains('1:4');
    },
  );

  test(
    'URL updates when navigating verses',
    { tag: ['@study-mode', '@tafsir', '@ssr'] },
    async () => {
      await studyModePage.goToTafsirPage('1:3');
      await studyModePage.waitForContent();

      await studyModePage.clickNextVerse();
      await studyModePage.waitForUrlContains('1:4');

      await studyModePage.clickPreviousVerse();
      await studyModePage.waitForUrlContains('1:3');
    },
  );

  test(
    'Tafsir page renders correct verse for chapter 1',
    { tag: ['@study-mode', '@tafsir', '@ssr'] },
    async ({ page }) => {
      await studyModePage.goToTafsirPage('1:3');
      await studyModePage.waitForContent();

      await expect(studyModePage.content).toBeVisible();
      expect(page.url()).toContain('1:3');
    },
  );
});
