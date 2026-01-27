import { test, expect } from '@playwright/test';

import StudyModePage from '@/tests/POM/study-mode-page';
import { TestId } from '@/tests/test-ids';

let studyModePage: StudyModePage;

test.describe('Study Mode Navigation', () => {
  test.beforeEach(async ({ page, context }) => {
    studyModePage = new StudyModePage(page, context);
  });

  test(
    'Previous verse button works correctly',
    { tag: ['@study-mode', '@navigation', '@ssr'] },
    async () => {
      await studyModePage.goToTafsirPage('1:5');
      await studyModePage.waitForContent();

      await studyModePage.clickPreviousVerse();
      await studyModePage.waitForUrlContains('1:4');

      await studyModePage.clickPreviousVerse();
      await studyModePage.waitForUrlContains('1:3');
    },
  );

  test(
    'Next verse button works correctly',
    { tag: ['@study-mode', '@navigation', '@ssr'] },
    async () => {
      await studyModePage.goToTafsirPage('1:3');
      await studyModePage.waitForContent();

      await studyModePage.clickNextVerse();
      await studyModePage.waitForUrlContains('1:4');

      await studyModePage.clickNextVerse();
      await studyModePage.waitForUrlContains('1:5');
    },
  );

  test(
    'Previous button is disabled on first verse',
    { tag: ['@study-mode', '@navigation', '@ssr'] },
    async () => {
      await studyModePage.goToTafsirPage('1:1');
      await studyModePage.waitForContent();

      await expect(studyModePage.prevVerseButton).toHaveAttribute('disabled', '');
    },
  );

  test(
    'Next button is disabled on last verse of chapter',
    { tag: ['@study-mode', '@navigation', '@ssr'] },
    async () => {
      await studyModePage.goToTafsirPage('1:7');
      await studyModePage.waitForContent();

      await expect(studyModePage.nextVerseButton).toHaveAttribute('disabled', '');
    },
  );

  test(
    'Tab switching updates URL - tafsir to reflections',
    { tag: ['@study-mode', '@navigation', '@ssr'] },
    async ({ page }) => {
      await studyModePage.goToTafsirPage('1:3');
      await studyModePage.waitForContent();

      const reflectionsTab = page.getByTestId(TestId.STUDY_MODE_TAB_REFLECTIONS);
      await reflectionsTab.click();

      await studyModePage.waitForUrlContains('reflections');
    },
  );

  test(
    'Tab switching updates URL - tafsir to lessons',
    { tag: ['@study-mode', '@navigation', '@ssr'] },
    async ({ page }) => {
      await studyModePage.goToTafsirPage('1:3');
      await studyModePage.waitForContent();

      const lessonsTab = page.getByTestId(TestId.STUDY_MODE_TAB_LESSONS);
      await lessonsTab.click();

      await studyModePage.waitForUrlContains('lessons');
    },
  );

  test(
    'Navigation preserves tab state across verse changes',
    { tag: ['@study-mode', '@navigation', '@ssr'] },
    async () => {
      await studyModePage.goToReflectionsPage('1:3');
      await studyModePage.waitForContent();

      await studyModePage.clickNextVerse();

      await studyModePage.waitForUrlContains('reflections');
      await studyModePage.waitForUrlContains('1:4');
    },
  );
});
