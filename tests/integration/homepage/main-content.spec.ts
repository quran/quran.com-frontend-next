import { test, expect } from '@playwright/test';

import ayahOfTheDayData from '@/data/ayah_of_the_day.json';
import Homepage from '@/tests/POM/home-page';

let homePage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);
});

test(
  'Last visited ayah is displayed on the homepage and clicking it takes the user to the ayah',
  { tag: ['@slow', '@homepage', '@persistence'] },
  async ({ page, isMobile }) => {
    // Go to ayah 5:10
    await homePage.goTo('/5:10');

    // FIXME: The problem is that the <MobileReadingTabs /> component is not loading when going to the ayah page directly
    // unless we scroll a bit. But this component is the one that saves the last read ayah.
    // So we need to fix this issue in the component and then remove this workaround for mobile.
    // I know the problem comes from line 51 of src\components\QuranReader\ContextMenu\index.tsx (where it early returns null if first render)
    if (isMobile) {
      await page.mouse.wheel(0, 100);
    }

    await page.waitForTimeout(2000); // Wait for 2 seconds to ensure the visit is recorded

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
  // Check if today's date has an entry in the ayah_of_the_day.json file
  const now = new Date();
  const day = String(now.getUTCDate()).padStart(2, '0');
  const month = String(now.getUTCMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const year = now.getUTCFullYear();
  const todayString = `${day}/${month}/${year}`;

  const ayahEntry = ayahOfTheDayData.find((entry) => entry.date === todayString);
  if (!ayahEntry) {
    test.skip(true, `No Ayah of the Day entry for today's date: ${todayString}`);
    return;
  }

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

test('All 30 juz are displayed when switching to the juz tab', async ({ page }) => {
  await homePage.goTo();

  const chapterAndJuzList = page.getByTestId('chapter-and-juz-list');
  const tabContainer = chapterAndJuzList.getByTestId('tabs-container');
  const juzTab = tabContainer.getByText('Juz');
  await juzTab.click();

  await expect(tabContainer).toHaveAttribute('data-selectedtab', 'juz');

  await expect(chapterAndJuzList.getByTestId('juz-1-container')).toBeVisible();
  await expect(chapterAndJuzList.getByTestId('juz-30-container')).toBeVisible();

  // Juz 1 container should have 3 links: juz link + surahs 1 and 2
  const juz1Container = chapterAndJuzList.getByTestId('juz-1-container');
  const links = juz1Container.getByRole('link');
  expect(await links.count()).toBe(3);

  // Juz 30 container should have 38 links (surahs from 78 to 114 + juz link)
  const juz30Container = chapterAndJuzList.getByTestId('juz-30-container');
  const links30 = juz30Container.getByRole('link');
  expect(await links30.count()).toBe(38);
});

test('All 114 surahs are displayed according to the revelation order when switching to the revelation tab', async ({
  page,
}) => {
  await homePage.goTo();

  const chapterAndJuzList = page.getByTestId('chapter-and-juz-list');
  const tabContainer = chapterAndJuzList.getByTestId('tabs-container');
  const revelationTab = tabContainer.getByText('Revelation Order');
  await revelationTab.click();

  await expect(tabContainer).toHaveAttribute('data-selectedtab', 'revelation_order');

  await expect(chapterAndJuzList.getByText("Al-'Alaq")).toBeVisible(); // Al-Alaq, first revealed surah
  await expect(chapterAndJuzList.getByText('An-Nasr')).toBeVisible(); // An-Nasr, last revealed surah

  const firstChapter = chapterAndJuzList.getByText("Al-'Alaq");
  const lastChapter = chapterAndJuzList.getByText('An-Nasr');

  // Ensure the first revealed chapter appears before the last revealed chapter
  const firstChapterBoundingBox = await firstChapter.boundingBox();
  const lastChapterBoundingBox = await lastChapter.boundingBox();
  expect(firstChapterBoundingBox!.y).toBeLessThan(lastChapterBoundingBox!.y);
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

test('Popular button shows the popular surahs/verses', { tag: ['@homepage'] }, async ({ page }) => {
  await homePage.goTo();

  const popularButton = page.getByTestId('popular-button');
  await expect(popularButton).toBeVisible();
  await popularButton.click();

  const dropdownContainer = page.getByTestId('quick-links');
  await expect(dropdownContainer).toBeVisible();

  const items = dropdownContainer.getByRole('link');
  expect(await items.count()).toBeGreaterThanOrEqual(3);
});
