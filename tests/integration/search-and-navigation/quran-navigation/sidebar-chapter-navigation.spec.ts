/* eslint-disable react-func/max-lines-per-function */
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
      // 0. Ensure the Navigate Quran drawer is not mounted before opening it
      await expect(page.getByTestId('sidebar-navigation')).not.toBeAttached();

      // 1. Click on the Navigate Quran button
      await page.getByTestId('navigate-quran-button').click();
      // 2. Make sure the Navigate Quran drawer is visible
      await expect(page.getByTestId('sidebar-navigation')).toBeVisible();

      // 3. Click the `Close Navigation Sidebar` button
      await page.getByLabel('Close Navigation Sidebar').click();

      // 4. Ensure the Navigate Quran drawer is unmounted after closing it
      await expect(page.getByTestId('sidebar-navigation')).not.toBeAttached();
    },
  );

  test(
    'Navigation drawer should only appear on Quran reader pages',
    { tag: ['@slow', '@drawer'] },
    async ({ page }) => {
      // 1. Make sure the navigation drawer is not mounted by default
      await expect(page.getByTestId('sidebar-navigation')).not.toBeAttached();

      // 2. Go to a a surah page
      await homePage.goTo('/2');

      // 3. Open the navigation drawer
      await page.getByTestId('chapter-navigation').click({ position: { x: 5, y: 5 } });

      // 4. Make sure the navigation drawer is visible
      await expect(page.getByTestId('sidebar-navigation')).toBeVisible();

      // 5. Go to the homepage
      await homePage.goTo('/');
      // 6. Make sure the navigation drawer is not attached on the homepage
      await expect(page.getByTestId('sidebar-navigation')).not.toBeAttached();
      // 7. Go to the media page
      await homePage.goTo('/media');
      // 8. Make sure the navigation drawer is not attached on the media page
      await expect(page.getByTestId('sidebar-navigation')).not.toBeAttached();
    },
  );
});

test.describe('Navigation Sidebar Route Regressions', () => {
  test(
    '"Navigate Quran" button mounts sidebar on the homepage',
    { tag: ['@fast', '@navigation', '@sidebar'] },
    async ({ page }) => {
      const sidebar = page.getByTestId('sidebar-navigation');

      await expect(sidebar).not.toBeAttached();

      await page.getByTestId('navigate-quran-button').click();

      await expect(sidebar).toBeVisible();
    },
  );

  test(
    'Sidebar remains visible after navigating to the first chapter from the homepage',
    { tag: ['@slow', '@navigation', '@sidebar'] },
    async ({ page, isMobile }) => {
      test.skip(isMobile, 'Sidebar navigation is not visible after navigation on mobile devices');

      const sidebar = page.getByTestId('sidebar-navigation');
      await page.getByTestId('navigate-quran-button').click();
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
      await page.getByTestId('navigate-quran-button').click();
      const sidebar = page.getByTestId('sidebar-navigation');
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
      test.skip(isMobile);

      await homePage.goTo('/1');
      const sidebar = page.getByTestId('sidebar-navigation');
      await expect(sidebar).not.toBeAttached();

      await page.getByTestId('chapter-navigation').click({ position: { x: 5, y: 5 } });
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
      test.skip(isMobile);

      await homePage.goTo('/1');
      const sidebar = page.getByTestId('sidebar-navigation');
      await expect(sidebar).not.toBeAttached();

      await page.getByTestId('chapter-navigation').click({ position: { x: 5, y: 5 } });
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
      await Promise.all([page.waitForURL('/9'), navigationList.getByText('At-Tawbah').click()]);
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
      await Promise.all([page.waitForURL('/1?startingVerse=3'), verseList.getByText('3').click()]);
      await expect(page).toHaveURL(/\/1\?startingVerse=3$/);
    },
  );

  test(
    'Selecting a Surah in verse view navigates to verse 1',
    { tag: ['@slow', '@navigation', '@verse'] },
    async ({ page, isMobile }) => {
      test.skip(isMobile, 'Drawer navigation closes automatically on mobile devices');

      await page.getByTestId('navigate-quran-button').click();
      await page.getByTestId('verse-button').click();

      const sidebar = page.getByTestId('sidebar-navigation');
      await Promise.all([
        page.waitForURL(/\/2\?startingVerse=1$/),
        sidebar.getByText('Al-Baqarah', { exact: true }).click(),
      ]);
      await expect(page).toHaveURL(/\/2\?startingVerse=1$/);

      const verseOne = page.getByTestId('verse-list').getByText('1', { exact: true });
      await verseOne.waitFor({ state: 'visible' });
      await expect(verseOne).toHaveClass(/selectedItem/);
    },
  );

  test(
    'Switching Surahs after selecting another verse resets to verse 1',
    { tag: ['@slow', '@navigation', '@verse'] },
    async ({ page, isMobile }) => {
      test.skip(isMobile, 'Drawer navigation closes automatically on mobile devices');

      await page.getByTestId('navigate-quran-button').click();
      await page.getByTestId('verse-button').click();

      const sidebar = page.getByTestId('sidebar-navigation');
      const verseList = page.getByTestId('verse-list');
      const getVerseItem = (value: string) => verseList.getByText(value, { exact: true });

      await Promise.all([
        page.waitForURL(/\/24\?startingVerse=1$/),
        sidebar.getByText('An-Nur', { exact: true }).click(),
      ]);
      await expect(page).toHaveURL(/\/24\?startingVerse=1$/);
      await getVerseItem('1').waitFor({ state: 'visible' });
      await expect(getVerseItem('1')).toHaveClass(/selectedItem/);

      await Promise.all([page.waitForURL(/\/24\?startingVerse=5$/), getVerseItem('5').click()]);
      await expect(page).toHaveURL(/\/24\?startingVerse=5$/);
      await expect(getVerseItem('5')).toHaveClass(/selectedItem/);

      await Promise.all([
        page.waitForURL(/\/8\?startingVerse=1$/),
        sidebar.getByText('Al-Anfal', { exact: true }).click(),
      ]);
      await expect(page).toHaveURL(/\/8\?startingVerse=1$/);
      await getVerseItem('1').waitFor({ state: 'visible' });
      await expect(getVerseItem('1')).toHaveClass(/selectedItem/);
      await expect(getVerseItem('5')).not.toHaveClass(/selectedItem/);
    },
  );

  test(
    'Selecting the same Surah twice keeps verse 1 selected',
    { tag: ['@slow', '@navigation', '@verse'] },
    async ({ page, isMobile }) => {
      test.skip(isMobile, 'Drawer navigation closes automatically on mobile devices');

      await page.getByTestId('navigate-quran-button').click();
      await page.getByTestId('verse-button').click();

      const sidebar = page.getByTestId('sidebar-navigation');
      const alBaqarah = sidebar.getByText('Al-Baqarah', { exact: true });

      await Promise.all([page.waitForURL(/\/2\?startingVerse=1$/), alBaqarah.click()]);
      const firstUrl = page.url();

      await Promise.all([page.waitForURL(firstUrl), alBaqarah.click()]);
      await expect(page).toHaveURL(firstUrl);

      const verseOne = page.getByTestId('verse-list').getByText('1', { exact: true });
      await expect(verseOne).toHaveClass(/selectedItem/);
    },
  );

  test(
    'Clicking the same verse twice keeps the same URL and selection',
    { tag: ['@slow', '@navigation', '@verse'] },
    async ({ page, isMobile }) => {
      test.skip(isMobile, 'Drawer navigation closes automatically on mobile devices');

      await page.getByTestId('navigate-quran-button').click();
      await page.getByTestId('verse-button').click();

      const sidebar = page.getByTestId('sidebar-navigation');
      const verseList = page.getByTestId('verse-list');

      // First, click on Al-Fatihah to load its verses
      await sidebar.getByText('Al-Fatihah', { exact: true }).click();

      // Then wait for verse 3 to be visible before clicking it
      const verseThree = verseList.getByText('3', { exact: true });
      await verseThree.waitFor({ state: 'visible' });

      // Now click verse 3 and wait for the URL change
      await Promise.all([page.waitForURL(/\/1\?startingVerse=3$/), verseThree.click()]);
      await expect(page).toHaveURL(/\/1\?startingVerse=3$/);
      await expect(verseThree).toHaveClass(/selectedItem/);

      // Click the same verse again and verify nothing changes
      await Promise.all([page.waitForURL(/\/1\?startingVerse=3$/), verseThree.click()]);
      await expect(page).toHaveURL(/\/1\?startingVerse=3$/);
      await expect(verseThree).toHaveClass(/selectedItem/);
    },
  );

  test(
    'Reopening the drawer on mobile preserves verse selection after navigation',
    { tag: ['@slow', '@navigation', '@verse', '@mobile'] },
    async ({ page, isMobile }) => {
      test.skip(!isMobile, 'Only applicable on mobile layouts');

      await page.getByTestId('navigate-quran-button').click();
      await page.getByTestId('verse-button').click();

      const sidebar = page.getByTestId('sidebar-navigation');

      // Navigate to Al-Baqarah and wait for URL and chapter to fully load
      await Promise.all([
        page.waitForURL(/\/2\?startingVerse=1$/),
        sidebar.getByText('Al-Baqarah', { exact: true }).click(),
      ]);
      await expect(page).toHaveURL(/\/2\?startingVerse=1$/);

      // Wait for the verse list to be fully loaded and rendered
      const verseList = page.getByTestId('verse-list');
      await verseList.waitFor({ state: 'visible' });

      // select verse 10
      const verseTen = verseList.getByText('10', { exact: true });
      await verseTen.waitFor({ state: 'visible' });
      await Promise.all([page.waitForURL(/\/2\?startingVerse=10$/), verseTen.click()]);

      // Give the UI time to settle and close the drawer
      await page.waitForTimeout(500);

      // Verify the sidebar is detached (drawer closed automatically on mobile after selection)
      await expect(page.getByTestId('sidebar-navigation')).not.toBeAttached();
      await page.waitForTimeout(300);

      // Reopen the sidebar
      await page.getByTestId('chapter-navigation').click({ position: { x: 5, y: 5 } });
      const reopenedSidebar = page.getByTestId('sidebar-navigation');
      await reopenedSidebar.waitFor({ state: 'visible' });

      // Give the drawer animation time to complete
      await page.waitForTimeout(300);

      // Click on the verse button to switch to verse view
      await page.getByTestId('verse-button').click();

      // Wait for the verse list to be fully rendered after button click
      const reopenedVerseList = page.getByTestId('verse-list');
      await reopenedVerseList.waitFor({ state: 'visible' });

      // Wait for verse items to be in the DOM
      await reopenedVerseList.getByText('1', { exact: true }).waitFor({ state: 'visible' });

      // check that verse 10 is still selected
      const verseTenAfterReopen = reopenedVerseList.getByText('10', { exact: true });
      await verseTenAfterReopen.waitFor({ state: 'visible' });
      await expect(verseTenAfterReopen).toHaveClass(/selectedItem/);
    },
  );

  test(
    'Selecting a new Surah from a verse-specific URL resets to verse 1 when returning',
    { tag: ['@slow', '@navigation', '@verse'] },
    async ({ page, isMobile }) => {
      test.skip(isMobile, 'Drawer navigation closes automatically on mobile devices');

      await homePage.goTo('/24?startingVerse=10');
      await page.getByTestId('chapter-navigation').click({ position: { x: 5, y: 5 } });
      await page.getByTestId('verse-button').click();

      const sidebar = page.getByTestId('sidebar-navigation');
      const verseList = page.getByTestId('verse-list');
      const getVerseItem = (value: string) => verseList.getByText(value, { exact: true });

      await expect(getVerseItem('10')).toBeVisible();

      await Promise.all([
        page.waitForURL(/\/8\?startingVerse=1$/),
        sidebar.getByText('Al-Anfal', { exact: true }).click(),
      ]);
      await expect(page).toHaveURL(/\/8\?startingVerse=1$/);

      await Promise.all([
        page.waitForURL(/\/24\?startingVerse=1$/),
        sidebar.getByText('An-Nur', { exact: true }).click(),
      ]);
      await expect(page).toHaveURL(/\/24\?startingVerse=1$/);

      await getVerseItem('1').waitFor({ state: 'visible' });
      await expect(getVerseItem('1')).toHaveClass(/selectedItem/);
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
      await Promise.all([page.waitForURL('/juz/18'), navigationList.getByText('Juz 18').click()]);
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
      await Promise.all([
        page.waitForURL('/page/100'),
        navigationList.getByText('Page 100').click(),
      ]);
      await expect(page).toHaveURL(/\/page\/100$/);
    },
  );
});
