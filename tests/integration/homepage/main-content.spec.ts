import { test, expect } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';

let homePage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);
});

test(
  'Last visited ayah is displayed on the homepage and clicking it takes the user to the ayah',
  { tag: ['@slow', '@homepage', '@persistence'] },
  async ({ page }) => {
    // Go to ayah 5:10
    await homePage.goTo('/5:10');

    // Go to homepage
    await homePage.goTo();

    // Make sure the last visited ayah is displayed on the homepage
    const lastVisitedAyah = page.getByTestId('continue-reading-chapter-card');
    await expect(lastVisitedAyah).toBeVisible();
    const text = await lastVisitedAyah.textContent();
    expect(text).toContain("5. Al-Ma'idah");
    expect(text).toContain('10');

    // Click on the last visited ayah link
    await Promise.all([
      page.waitForURL('**/5?startingVerse=10', { waitUntil: 'networkidle' }),
      lastVisitedAyah.click(),
    ]);
  },
);

test('Quran in a Year section appears and has a Quranic verse', async ({ page }) => {
  await homePage.goTo();

  const quranInAYearSection = page.getByTestId('quran-in-a-year-section');
  await expect(quranInAYearSection).toBeVisible();
  const text = await quranInAYearSection.textContent();
  expect(text).toContain('Mustafa Khattab'); // If it contains the translator name, it means a verse is displayed
});

test('Learning Plans section appears with at least 3 items', async ({ page }) => {
  await homePage.goTo();

  const learningPlansSection = page.getByTestId('learning-plans-section');
  await expect(learningPlansSection).toBeVisible();

  const items = learningPlansSection.getByRole('link');
  expect(await items.count()).toBeGreaterThanOrEqual(3);
});

test('Coomunity section appears with at lest 1 item', async ({ page }) => {
  await homePage.goTo();

  const communitySection = page.getByTestId('community-section');
  await expect(communitySection).toBeVisible();

  const items = communitySection.getByRole('link');
  expect(await items.count()).toBeGreaterThanOrEqual(1);
});

test('Surah is selected by default', async ({ page }) => {
  await homePage.goTo();

  const chapterAndJuzList = page.getByTestId('chapter-and-juz-list');
  await expect(chapterAndJuzList).toBeVisible();
  const tabContainer = chapterAndJuzList.getByTestId('tabs-container');
  // Make sure the Surah tab is selected by default
  expect(await tabContainer.getAttribute('data-selectedtab')).toBe('surah');
});

test('All 114 surahs are displayed in the surah list', async ({ page }) => {
  await homePage.goTo();

  const chapterAndJuzList = page.getByTestId('chapter-and-juz-list');

  await expect(chapterAndJuzList.getByTestId('chapter-1-container')).toBeVisible();
  await expect(chapterAndJuzList.getByTestId('chapter-114-container')).toBeVisible();
});

test('Sort by ascending/descending works correctly', async ({ page }) => {
  await homePage.goTo();

  const chapterAndJuzList = page.getByTestId('chapter-and-juz-list');
  const tabContainer = chapterAndJuzList.getByTestId('tabs-container');
  const sorter = tabContainer.getByText('Ascending');
  // Ensure 'Ascending' is selected by default
  await expect(sorter).toBeVisible();

  const firstChapter = chapterAndJuzList.getByTestId('chapter-1-container');
  const lastChapter = chapterAndJuzList.getByTestId('chapter-114-container');

  // Ensure the first chapter appears before the last chapter
  const firstChapterBoundingBox = await firstChapter.boundingBox();
  const lastChapterBoundingBox = await lastChapter.boundingBox();
  expect(firstChapterBoundingBox!.y).toBeLessThan(lastChapterBoundingBox!.y);

  // Click on the sorter to change the sort order to descending
  await sorter.click();

  // Ensure both chapters are still visible
  await expect(firstChapter).toBeVisible();
  await expect(lastChapter).toBeVisible();

  // Ensure the last chapter now appears before the first chapter
  const updatedFirstChapterBoundingBox = await firstChapter.boundingBox();
  const updatedLastChapterBoundingBox = await lastChapter.boundingBox();
  expect(updatedLastChapterBoundingBox!.y).toBeLessThan(updatedFirstChapterBoundingBox!.y);
});
