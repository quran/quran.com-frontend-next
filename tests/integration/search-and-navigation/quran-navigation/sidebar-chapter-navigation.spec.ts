/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable max-lines */
import { test, expect } from '@playwright/test';

import { openQuranNavigation } from '@/tests/helpers/navigation';
import Homepage from '@/tests/POM/home-page';
import { TestId } from '@/tests/test-ids';

let homePage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);
  await homePage.goTo();
});

test.describe('Navigation Sidebar Operations', () => {
  test(
    'Navigation sidebar opens and closes correctly',
    { tag: ['@fast', '@navigation', '@sidebar'] },
    async ({ page }) => {
      // 0. Ensure the Navigate Quran drawer is not mounted before opening it
      await expect(page.getByTestId(TestId.SIDEBAR_NAVIGATION)).not.toBeAttached();

      // 1. Click on the Navigate Quran button
      await openQuranNavigation(page);
      // 2. Make sure the Navigate Quran drawer is visible
      await expect(page.getByTestId(TestId.SIDEBAR_NAVIGATION)).toBeVisible();

      // 3. Click the `Close Navigation Sidebar` button
      await page.getByLabel('Close Navigation Sidebar').click();

      // 4. Ensure the Navigate Quran drawer is unmounted after closing it
      await expect(page.getByTestId(TestId.SIDEBAR_NAVIGATION)).not.toBeAttached();
    },
  );

  test(
    'Navigation drawer should only appear on Quran reader pages',
    { tag: ['@slow', '@drawer'] },
    async ({ page, isMobile }) => {
      // 1. Make sure the navigation drawer is not mounted by default
      await expect(page.getByTestId(TestId.SIDEBAR_NAVIGATION)).not.toBeAttached();

      // 2. Go to a a surah page
      await homePage.goTo('/2');

      if (isMobile) {
        // Scroll down a little to make sure the chapter navigation button is visible
        await page.mouse.wheel(0, 500);
      }

      // 3. Open the navigation drawer
      await page.getByTestId(TestId.CHAPTER_NAVIGATION).click({ position: { x: 5, y: 5 } });

      // 4. Make sure the navigation drawer is visible
      await expect(page.getByTestId(TestId.SIDEBAR_NAVIGATION)).toBeVisible();

      // 5. Go to the homepage
      await homePage.goTo('/');
      // 6. Make sure the navigation drawer is not attached on the homepage
      await expect(page.getByTestId(TestId.SIDEBAR_NAVIGATION)).not.toBeAttached();
      // 7. Go to the media page
      await homePage.goTo('/media');
      // 8. Make sure the navigation drawer is not attached on the media page
      await expect(page.getByTestId(TestId.SIDEBAR_NAVIGATION)).not.toBeAttached();
    },
  );
});

test.describe('Navigation Sidebar Route Regressions', () => {
  test(
    '"Navigate Quran" button mounts sidebar on the homepage',
    { tag: ['@fast', '@navigation', '@sidebar'] },
    async ({ page }) => {
      const sidebar = page.getByTestId(TestId.SIDEBAR_NAVIGATION);

      await expect(sidebar).not.toBeAttached();

      await openQuranNavigation(page);

      await expect(sidebar).toBeVisible();
    },
  );

  test(
    'Sidebar remains visible after navigating to the first chapter from the homepage',
    { tag: ['@slow', '@navigation', '@sidebar'] },
    async ({ page, isMobile }) => {
      test.skip(isMobile, 'Sidebar navigation is not visible after navigation on mobile devices');

      const sidebar = page.getByTestId(TestId.SIDEBAR_NAVIGATION);
      await openQuranNavigation(page);
      await expect(sidebar).toBeVisible();

      await Promise.all([page.goto('/1'), page.waitForURL(/\/1$/)]);

      await expect(page).toHaveURL(/\/1$/);
      await expect(sidebar).toBeVisible();
    },
  );

  test(
    "Selecting Al-An'am keeps the drawer visible while navigating to /6",
    { tag: ['@slow', '@navigation', '@sidebar'] },
    async ({ page }) => {
      await openQuranNavigation(page);
      const sidebar = page.getByTestId(TestId.SIDEBAR_NAVIGATION);
      await expect(sidebar).toBeVisible();

      const alAnamListItem = sidebar.getByText("Al-An'am", { exact: true });
      await expect(alAnamListItem).toBeVisible();

      await Promise.all([page.waitForURL(/\/6$/), alAnamListItem.click()]);

      await expect(page).toHaveURL(/\/6$/);
      await expect(sidebar).toBeVisible();
    },
  );

  test(
    'Leaving a reader page through the header logo hides the sidebar on the homepage',
    { tag: ['@slow', '@navigation', '@sidebar'] },
    async ({ page, isMobile }) => {
      await homePage.goTo('/1');
      const sidebar = page.getByTestId(TestId.SIDEBAR_NAVIGATION);
      await expect(sidebar).not.toBeAttached();

      if (isMobile) {
        // Scroll down a little to make sure the chapter navigation button is visible
        await page.mouse.wheel(0, 500);
        await page.mouse.wheel(0, -300);
      }

      await page.getByTestId(TestId.CHAPTER_NAVIGATION).click({ position: { x: 5, y: 5 } });
      await expect(sidebar).toBeVisible();

      await Promise.all([
        page.waitForURL(/\/$/),
        page.getByTitle('Quran.com').first().click({ force: true }),
      ]);

      await expect(page).toHaveURL(/\/$/);
      await expect(sidebar).not.toBeAttached();
    },
  );

  test(
    'Sidebar hides after navigating from a reader page to the learning plans index',
    { tag: ['@slow', '@navigation', '@sidebar'] },
    async ({ page, isMobile }) => {
      await homePage.goTo('/1');
      const sidebar = page.getByTestId(TestId.SIDEBAR_NAVIGATION);
      await expect(sidebar).not.toBeAttached();

      if (isMobile) {
        // Scroll down a little to make sure the chapter navigation button is visible
        await page.mouse.wheel(0, 500);
        await page.mouse.wheel(0, -300);
      }

      await page.getByTestId(TestId.CHAPTER_NAVIGATION).click({ position: { x: 5, y: 5 } });
      await expect(sidebar).toBeVisible();

      await homePage.goTo('/learning-plans');

      await expect(page).toHaveURL(/\/learning-plans$/);
      await expect(sidebar).not.toBeAttached();
    },
  );
});

// eslint-disable-next-line react-func/max-lines-per-function
test.describe('Chapter Navigation and Search', () => {
  test(
    'Chapter list displays and chapter search filters correctly',
    { tag: ['@fast', '@navigation', '@search'] },
    async ({ page }) => {
      // 1. Click on the Navigate Quran button
      await openQuranNavigation(page);

      // 2. Make sure the Surahs list is visible
      const surahsList = page.getByTestId(TestId.SIDEBAR_NAVIGATION);
      await expect(surahsList).toContainText('Al-Hajj');
      await expect(surahsList).toContainText('Taha');

      // 3. Search for a Surah
      const searchInput = page.getByPlaceholder('Search Surah');
      await searchInput.fill('Al-Baqarah');

      // 4. Make sure the Surah shows up in the list
      await expect(surahsList).toContainText('Al-Baqarah');
      await expect(surahsList).not.toContainText('Al-Hajj');
      await expect(surahsList).not.toContainText('Taha');
    },
  );

  test(
    'Verse navigation displays correct verse range for selected chapter',
    { tag: ['@fast', '@navigation', '@verses'] },
    async ({ page }) => {
      // 1. Click on the Navigate Quran button
      await openQuranNavigation(page);

      // 2. Click on the Verse button
      const verseButton = page.getByTestId(TestId.VERSE_BUTTON);
      await verseButton.click();

      // 3. Verify that clicking on Al Ma'idah shows verse from 1 to 120
      const surahsList = page.getByTestId(TestId.SIDEBAR_NAVIGATION);
      const alMaidaButton = surahsList.getByText("Al-Ma'idah");
      await alMaidaButton.click();

      const versesList = page.getByTestId(TestId.VERSE_LIST);
      // Ensure verse 1 and 120 are present in the list
      await expect(versesList.getByText('1', { exact: true })).toBeVisible();
      await expect(versesList.getByText('120', { exact: true })).toBeVisible();
      // Ensure verse 121 is not present in the list (exact match)
      await expect(versesList.getByText('121', { exact: true })).not.toBeVisible();
    },
  );
});

test.describe('Quran Structure Navigation', () => {
  test(
    'Juz list displays all 30 Juzs correctly',
    { tag: ['@fast', '@navigation', '@juz'] },
    async ({ page }) => {
      // 1. Click on the Navigate Quran button
      await openQuranNavigation(page);

      // 2. Click on the Juz button
      const juzButton = page.getByTestId(TestId.JUZ_BUTTON);
      await juzButton.click();

      // 3. Make sure the Juz list is visible
      const juzList = page.getByTestId(TestId.SIDEBAR_NAVIGATION);
      await expect(juzList).toContainText('Juz 1');
      await expect(juzList).toContainText('Juz 30');
      await expect(juzList).not.toContainText('Juz 31');
    },
  );

  test(
    'Page list displays all 604 pages correctly',
    { tag: ['@fast', '@navigation', '@pages'] },
    async ({ page }) => {
      // 1. Click on the Navigate Quran button
      await openQuranNavigation(page);

      // 2. Click on the Page button
      const pageButton = page.getByTestId(TestId.PAGE_BUTTON);
      await pageButton.click();

      // 3. Make sure the Page list is visible
      const pageList = page.getByTestId(TestId.SIDEBAR_NAVIGATION);
      await expect(pageList).toContainText('Page 1');
      await expect(pageList).toContainText('Page 604');
      await expect(pageList).not.toContainText('Page 605');
    },
  );
});

// eslint-disable-next-line react-func/max-lines-per-function
test.describe('Navigation Functionality', () => {
  test(
    'Surah navigation navigates to correct URL',
    { tag: ['@slow', '@navigation', '@links', '@surah'] },
    async ({ page }) => {
      // 1. Click on the Navigate Quran button
      await openQuranNavigation(page);

      const navigationList = page.getByTestId(TestId.SIDEBAR_NAVIGATION);

      // 2. Click on Surah At-Tawbah and ensure we are navigated to /9
      await Promise.all([page.waitForURL('/9'), navigationList.getByText('At-Tawbah').click()]);
      await expect(page).toHaveURL(/\/9$/);
    },
  );

  test(
    'Verse navigation navigates to correct URL',
    { tag: ['@slow', '@navigation', '@links', '@verse'] },
    async ({ page }) => {
      // 1. Click on the Navigate Quran button
      await openQuranNavigation(page);

      // 2. Now click on the "Verse" button
      const verseButton = page.getByTestId(TestId.VERSE_BUTTON);
      await verseButton.click();
      const verseList = page.getByTestId(TestId.VERSE_LIST);
      await verseList.getByText('3').waitFor({ state: 'visible' });

      // 3. Click on verse 3 and ensure we are navigated to /1?startingVerse=3
      await Promise.all([page.waitForURL('/1?startingVerse=3'), verseList.getByText('3').click()]);
      await expect(page).toHaveURL(/\/1\?startingVerse=3$/);
    },
  );

  test(
    'Juz navigation navigates to correct URL',
    { tag: ['@slow', '@navigation', '@links', '@juz'] },
    async ({ page }) => {
      // 1. Click on the Navigate Quran button
      await openQuranNavigation(page);

      // 2. Now click on the "Juz" button
      const juzButton = page.getByTestId(TestId.JUZ_BUTTON);
      await juzButton.click();
      const navigationList = page.getByTestId(TestId.SIDEBAR_NAVIGATION);
      await navigationList.getByText('Juz 18').waitFor({ state: 'visible' });

      // 3. Click on Juz 18 and ensure we are navigated to /juz/18
      await Promise.all([page.waitForURL('/juz/18'), navigationList.getByText('Juz 18').click()]);
      await expect(page).toHaveURL(/\/juz\/18$/);
    },
  );

  test(
    'Page navigation navigates to correct URL',
    { tag: ['@slow', '@navigation', '@links', '@page'] },
    async ({ page }) => {
      // 1. Click on the Navigate Quran button
      await openQuranNavigation(page);

      // 2. Now click on the "Page" button
      const pageButton = page.getByTestId(TestId.PAGE_BUTTON);
      await pageButton.click();
      const navigationList = page.getByTestId(TestId.SIDEBAR_NAVIGATION);
      await navigationList.getByText('Page 100').waitFor({ state: 'visible' });

      // 3. Click on Page 100 and ensure we are navigated to /page/100
      await Promise.all([
        page.waitForURL('/page/100'),
        navigationList.getByText('Page 100').click(),
      ]);
      await expect(page).toHaveURL(/\/page\/100$/);
    },
  );
});
