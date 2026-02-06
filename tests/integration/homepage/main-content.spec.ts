/* eslint-disable max-lines */
import { test, expect } from '@playwright/test';

import ayahOfTheDayData from '@/data/ayah_of_the_day.json';
import Homepage from '@/tests/POM/home-page';
import { getChapterContainerTestId, getJuzContainerTestId, TestId } from '@/tests/test-ids';

let homePage: Homepage;

const getTodayStringUTC = () => {
  const now = new Date();
  const day = String(now.getUTCDate()).padStart(2, '0');
  const month = String(now.getUTCMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const year = now.getUTCFullYear();
  return `${day}/${month}/${year}`;
};

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);
});

test(
  'Last visited ayah is displayed on the homepage and clicking it takes the user to the ayah',
  { tag: ['@slow', '@homepage', '@persistence'] },
  async ({ page, isMobile }) => {
    // Go to ayah 5:10
    await homePage.goTo('/5:10');

    if (isMobile) {
      await page.waitForTimeout(1500);
      await page.mouse.wheel(0, 100);
    }

    await expect
      .poll(async () => {
        const readingTracker = await homePage.getPersistedValue('readingTracker');
        return readingTracker?.lastReadVerse?.verseKey;
      })
      .toBe('5:10');

    // Go to homepage
    await homePage.goTo();

    // Make sure the last visited ayah is displayed on the homepage
    const lastVisitedAyah = page.getByTestId(TestId.CHAPTER_CARD);
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

test(
  'Quran in a Year section appears and has a Quranic verse',
  { tag: ['@slow', '@homepage', '@quran-in-a-year', '@smoke'] },
  async ({ page }) => {
    // Check if today's date has an entry in the ayah_of_the_day.json file
    const todayString = getTodayStringUTC();

    const ayahEntry = ayahOfTheDayData.find((entry) => entry.date === todayString);
    if (!ayahEntry) {
      test.skip(true, `No Ayah of the Day entry for today's date: ${todayString}`);
      return;
    }

    await homePage.goTo();
    await page.evaluate(() => localStorage.clear());
    await homePage.reload();

    const quranInAYearSection = page.getByTestId(TestId.QURAN_IN_A_YEAR_SECTION);
    await expect(quranInAYearSection).toBeVisible();
    const verseContainer = quranInAYearSection.getByTestId('quran-in-a-year-verse');
    await expect(verseContainer.locator('[class*="Spinner"]')).toHaveCount(0); // Ensure the verse rendered (no spinner)
  },
);

test(
  'Quran in a Year section renders when JavaScript is disabled',
  { tag: ['@quran-in-a-year', '@ssr'] },
  async ({ browser }) => {
    const todayString = getTodayStringUTC();

    const ayahEntry = ayahOfTheDayData.find((entry) => entry.date === todayString);
    test.skip(!ayahEntry, `No Ayah of the Day entry for today's date: ${todayString}`);

    const ssrContext = await browser.newContext({ javaScriptEnabled: false }); // Disable JS to simulate no-hydration scenario
    const ssrPage = await ssrContext.newPage();

    await ssrPage.goto('/', { waitUntil: 'networkidle' });

    const quranInAYearSection = ssrPage.getByTestId('quran-in-a-year-section');
    await expect(quranInAYearSection).toBeVisible();
    const verseContainer = quranInAYearSection.getByTestId('quran-in-a-year-verse');
    await expect(verseContainer.locator('[class*="Spinner"]')).toHaveCount(0); // Ensure SSR rendered verse (no spinner)

    await ssrContext.close(); // Clean up the no-JS context
  },
);

test(
  'Learning Plans section appears with at least 3 items',
  { tag: ['@homepage', '@learning-plans', '@smoke'] },
  async ({ page }) => {
    await homePage.goTo();

    const learningPlansSection = page.getByTestId(TestId.COURSES_LIST);
    await expect(learningPlansSection).toBeVisible();

    const items = learningPlansSection.getByRole('link');
    expect(await items.count()).toBeGreaterThanOrEqual(3);
  },
);

test('Community section appears with at least 1 item', async ({ page }) => {
  await homePage.goTo();

  const communitySection = page.getByTestId(TestId.COMMUNITY_SECTION);
  await expect(communitySection).toBeVisible();

  const items = communitySection.getByRole('link');
  expect(await items.count()).toBeGreaterThanOrEqual(1);
});

test('Surah is selected by default', { tag: ['@smoke'] }, async ({ page }) => {
  await homePage.goTo();

  const tabContainer = page.getByTestId(TestId.TABS_CONTAINER);
  // Make sure the Surah tab is selected by default
  expect(await tabContainer.getAttribute('data-selectedtab')).toBe('surah');
});

test('All 114 surahs are displayed in the surah list', async ({ page }) => {
  await homePage.goTo();

  const chapterAndJuzList = page.getByTestId(TestId.CHAPTER_AND_JUZ_LIST);

  await expect(chapterAndJuzList.getByTestId(getChapterContainerTestId(1))).toBeVisible();
  await expect(chapterAndJuzList.getByTestId(getChapterContainerTestId(114))).toBeVisible();
});

test('All 30 juz are displayed when switching to the juz tab', async ({ page }) => {
  await homePage.goTo();

  const tabContainer = page.getByTestId(TestId.TABS_CONTAINER);
  const juzTab = tabContainer.getByText('Juz');
  await juzTab.click();

  await expect(tabContainer).toHaveAttribute('data-selectedtab', 'juz');

  await expect(page.getByTestId(getJuzContainerTestId(1))).toBeVisible();
  await expect(page.getByTestId(getJuzContainerTestId(30))).toBeVisible();

  // Juz 1 container should have 3 links: juz link + surahs 1 and 2
  const juz1Container = page.getByTestId(getJuzContainerTestId(1));
  const links = juz1Container.getByRole('link');
  expect(await links.count()).toBe(3);

  // Juz 30 container should have 38 links (surahs from 78 to 114 + juz link)
  const juz30Container = page.getByTestId(getJuzContainerTestId(30));
  const links30 = juz30Container.getByRole('link');
  expect(await links30.count()).toBe(38);
});

test('All 114 surahs are displayed according to the revelation order when switching to the revelation tab', async ({
  page,
}) => {
  await homePage.goTo();

  const tabContainer = page.getByTestId(TestId.TABS_CONTAINER);
  const revelationTab = tabContainer.getByText('Revelation Order');
  await revelationTab.click();

  await expect(tabContainer).toHaveAttribute('data-selectedtab', 'revelation_order');

  await expect(page.getByText("Al-'Alaq")).toBeVisible(); // Al-Alaq, first revealed surah
  await expect(page.getByText('An-Nasr')).toBeVisible(); // An-Nasr, last revealed surah

  const firstChapter = page.getByText("Al-'Alaq");
  const lastChapter = page.getByText('An-Nasr');

  // Ensure the first revealed chapter appears before the last revealed chapter
  const firstChapterBoundingBox = await firstChapter.boundingBox();
  const lastChapterBoundingBox = await lastChapter.boundingBox();
  expect(firstChapterBoundingBox!.y).toBeLessThan(lastChapterBoundingBox!.y);
});

test('Popular button shows the popular surahs/verses', { tag: ['@homepage'] }, async ({ page }) => {
  await homePage.goTo();

  const popularButton = page.getByTestId(TestId.POPULAR_BUTTON);
  await expect(popularButton).toBeVisible();
  await popularButton.click();

  const dropdownContainer = page.getByTestId(TestId.QUICK_LINKS);
  await expect(dropdownContainer).toBeVisible();

  const items = dropdownContainer.getByRole('link');
  expect(await items.count()).toBeGreaterThanOrEqual(3);
});

test(
  'All 114 surahs render on the homepage when JavaScript is disabled',
  { tag: ['@homepage', '@ssr'] },
  async ({ browser }) => {
    const ssrContext = await browser.newContext({ javaScriptEnabled: false }); // Disable JS to verify SSR output
    const ssrPage = await ssrContext.newPage();

    await ssrPage.goto('/', { waitUntil: 'networkidle' });

    const chapterAndJuzList = ssrPage.getByTestId('chapter-and-juz-list');
    await expect(chapterAndJuzList).toBeVisible();
    await expect(chapterAndJuzList.getByTestId('chapter-1-container')).toBeVisible();
    await expect(chapterAndJuzList.getByTestId('chapter-114-container')).toBeVisible();

    await ssrContext.close(); // Clean up the no-JS context
  },
);
