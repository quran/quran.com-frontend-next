/* eslint-disable max-lines */
import { test, expect } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';

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
      // 0. Make sure the Navigate Quran drawer is not visible before opening it
      await expect(page.getByTestId('sidebar-navigation')).not.toBeVisible();

      // 1. Click on the Navigate Quran button
      await page.getByTestId('navigate-quran-button').click();
      // 2. Make sure the Navigate Quran drawer is visible
      await expect(page.getByTestId('sidebar-navigation')).toBeVisible();

      // 3. Click the `Close Navigation Sidebar` button
      await page.getByLabel('Close Navigation Sidebar').click();

      // 4. Make sure the Navigate Quran drawer is no longer visible after closing it
      await expect(page.getByTestId('sidebar-navigation')).not.toBeVisible();
    },
  );

  // TODO: Unskip when PR about QF-2082 is merged
  test.skip(
    'Navigation drawer should only appear on Quran reader pages',
    { tag: ['@slow', '@drawer'] },
    async ({ page }) => {
      // 1. Make sure the navigation drawer is not visible by default
      await expect(page.getByTestId('sidebar-navigation')).not.toBeVisible();

      // 2. Go to a a surah page
      await homePage.goTo('/2');

      // 3. Open the navigation drawer
      await page.getByTestId('chapter-navigation').click({ position: { x: 5, y: 5 } });

      // 4. Make sure the navigation drawer is visible
      await expect(page.getByTestId('sidebar-navigation')).toBeVisible();

      // 5. Go to the homepage
      await homePage.goTo('/');
      // 6. Make sure the navigation drawer is not visible on the homepage
      await expect(page.getByTestId('sidebar-navigation')).not.toBeVisible();
      // 7. Go to the media page
      await homePage.goTo('/media');
      // 8. Make sure the navigation drawer is not visible on the media page
      await expect(page.getByTestId('sidebar-navigation')).not.toBeVisible();
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
      await page.getByTestId('navigate-quran-button').click();

      // 2. Make sure the Surahs list is visible
      const surahsList = page.getByTestId('sidebar-navigation');
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
      await page.getByTestId('navigate-quran-button').click();

      // 2. Click on the Verse button
      const verseButton = page.getByTestId('verse-button');
      await verseButton.click();

      // 3. Verify that clicking on Al Ma'idah shows verse from 1 to 120
      const surahsList = page.getByTestId('sidebar-navigation');
      const alMaidaButton = surahsList.getByText("Al-Ma'idah");
      await alMaidaButton.click();

      const versesList = page.getByTestId('verse-list');
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
      await page.getByTestId('navigate-quran-button').click();

      // 2. Click on the Juz button
      const juzButton = page.getByTestId('juz-button');
      await juzButton.click();

      // 3. Make sure the Juz list is visible
      const juzList = page.getByTestId('sidebar-navigation');
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
      await page.getByTestId('navigate-quran-button').click();

      // 2. Click on the Page button
      const pageButton = page.getByTestId('page-button');
      await pageButton.click();

      // 3. Make sure the Page list is visible
      const pageList = page.getByTestId('sidebar-navigation');
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
      await page.getByTestId('navigate-quran-button').click();

      const navigationList = page.getByTestId('sidebar-navigation');

      // 2. Click on Surah At-Tawbah and ensure we are navigated to /9
      await navigationList.getByText('At-Tawbah').click();
      await page.waitForURL('/9');
      await expect(page).toHaveURL(/\/9$/);
    },
  );

  test(
    'Verse navigation navigates to correct URL',
    { tag: ['@slow', '@navigation', '@links', '@verse'] },
    async ({ page }) => {
      // 1. Click on the Navigate Quran button
      await page.getByTestId('navigate-quran-button').click();

      // 2. Now click on the "Verse" button
      const verseButton = page.getByTestId('verse-button');
      await verseButton.click();
      const verseList = page.getByTestId('verse-list');
      await verseList.getByText('3').waitFor({ state: 'visible' });

      // 3. Click on verse 3 and ensure we are navigated to /1?startingVerse=3
      await verseList.getByText('3').click();
      await page.waitForURL('/1?startingVerse=3');
      await expect(page).toHaveURL(/\/1\?startingVerse=3$/);
    },
  );

  test(
    'Juz navigation navigates to correct URL',
    { tag: ['@slow', '@navigation', '@links', '@juz'] },
    async ({ page }) => {
      // 1. Click on the Navigate Quran button
      await page.getByTestId('navigate-quran-button').click();

      // 2. Now click on the "Juz" button
      const juzButton = page.getByTestId('juz-button');
      await juzButton.click();
      const navigationList = page.getByTestId('sidebar-navigation');
      await navigationList.getByText('Juz 18').waitFor({ state: 'visible' });

      // 3. Click on Juz 18 and ensure we are navigated to /juz/18
      await navigationList.getByText('Juz 18').click();
      await page.waitForURL('/juz/18');
      await expect(page).toHaveURL(/\/juz\/18$/);
    },
  );

  test(
    'Page navigation navigates to correct URL',
    { tag: ['@slow', '@navigation', '@links', '@page'] },
    async ({ page }) => {
      // 1. Click on the Navigate Quran button
      await page.getByTestId('navigate-quran-button').click();

      // 2. Now click on the "Page" button
      const pageButton = page.getByTestId('page-button');
      await pageButton.click();
      const navigationList = page.getByTestId('sidebar-navigation');
      await navigationList.getByText('Page 100').waitFor({ state: 'visible' });

      // 3. Click on Page 100 and ensure we are navigated to /page/100
      await navigationList.getByText('Page 100').click();
      await page.waitForURL('/page/100');
      await expect(page).toHaveURL(/\/page\/100$/);
    },
  );
});
