/* eslint-disable no-await-in-loop */
import { expect, test } from '@playwright/test';

import { ensureEnglishLanguage } from '@/tests/helpers/language';
import { openNavigationDrawer } from '@/tests/helpers/navigation';
import Homepage from '@/tests/POM/home-page';
import { TestId } from '@/tests/test-ids';

let homePage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);
  await homePage.goTo('/');
  await ensureEnglishLanguage(page);
});

test(
  'Navigation drawer icon should open the drawer when clicked',
  { tag: ['@fast', '@drawer', '@smoke'] },
  async ({ page }) => {
    // Make sure the navigation drawer is not visible before opening it
    await expect(page.getByTestId(TestId.NAVIGATION_DRAWER_BODY)).not.toBeVisible();

    // Click to open the drawer
    await openNavigationDrawer(page);

    // Verify that the drawer is now visible
    await expect(page.getByTestId(TestId.NAVIGATION_DRAWER_BODY)).toBeVisible();
  },
);

test(
  'Navigation drawer close icon should close the drawer',
  { tag: ['@fast', '@drawer'] },

  async ({ page }) => {
    // 1. Open the navigation menu drawer
    await openNavigationDrawer(page);

    // 2. Make sure the navigation drawer is visible after opening it
    await expect(page.getByTestId(TestId.NAVIGATION_DRAWER_BODY)).toBeVisible();
    const navigationDrawer = page.getByTestId(TestId.NAVIGATION_DRAWER);

    // 3. Click on the close drawer button
    await navigationDrawer.getByLabel('Close Drawer').click();

    // 4. Make sure the navigation drawer is no longer visible after closing it
    await expect(page.getByTestId(TestId.NAVIGATION_DRAWER_BODY)).not.toBeVisible();
  },
);

test(
  'Clicking outside the drawer should close it',
  { tag: ['@fast', '@drawer'] },
  async ({ page, isMobile }) => {
    test.skip(
      isMobile,
      'This test is skipped on mobile as the drawer takes the full screen, so clicking outside is not possible.',
    );

    // 1. Open the navigation menu drawer
    await openNavigationDrawer(page);

    // 2. Click outside the drawer
    await page.click('body');

    // 3. Make sure the navigation drawer is no longer visible
    await expect(page.getByTestId(TestId.NAVIGATION_DRAWER_BODY)).not.toBeVisible();
  },
);

test('Functional navigation links in the drawer', { tag: ['@drawer'] }, async ({ page }) => {
  // Open the navigation drawer
  await openNavigationDrawer(page);
  await expect(page.getByTestId(TestId.NAVIGATION_DRAWER_BODY)).toBeVisible();

  // Check that the links in the drawer are working
  const drawer = page.getByTestId(TestId.NAVIGATION_DRAWER_BODY);
  const allLinks = drawer.locator('a');

  const links = await allLinks.all();
  // eslint-disable-next-line no-restricted-syntax
  for (const link of links) {
    const text = (await link.textContent())?.trim() || '';
    const href = (await link.getAttribute('href')) || '';
    const target = (await link.getAttribute('target')) || '';

    const expectedLink = drawerLinks.find((l) => l.text === text);

    expect(expectedLink, `Link with text "${text}" should be in the expected links`).toBeDefined();

    if (expectedLink) {
      // I did not put the links to the app stores in the drawerLinks mock because they may change
      if (expectedLink.href) {
        expect(href, `Link with text "${text}" should have href "${expectedLink?.href}"`).toBe(
          expectedLink.href,
        );
      }
      expect(target, `Link with text "${text}" should have target "${expectedLink?.target}"`).toBe(
        expectedLink.target,
      );
    }
  }
});

test(
  'Android and iOS app links are correct (the links should open the application store pages)',
  { tag: ['@slow', '@drawer'] },
  async ({ page }) => {
    // Open the navigation drawer
    await openNavigationDrawer(page);
    await expect(page.getByTestId(TestId.NAVIGATION_DRAWER_BODY)).toBeVisible();

    const drawer = page.getByTestId(TestId.NAVIGATION_DRAWER_BODY);
    await page.getByTestId(TestId.NAVIGATION_LINKS_OUR_PROJECTS).click();
    expect(
      await drawer.getByRole('link', { name: 'Quran For Android' }).getAttribute('href'),
    ).toContain('play.google.com');
    expect(await drawer.getByRole('link', { name: 'Quran iOS' }).getAttribute('href')).toContain(
      'apps.apple.com',
    );
  },
);

test(
  'Donate Monthly button should open the donation page in a new tab',
  { tag: ['@slow', '@drawer'] },
  async ({ page }) => {
    // 1. Open the navigation menu drawer
    await openNavigationDrawer(page);

    // Wait for the drawer body to be fully visible
    await expect(page.getByTestId(TestId.NAVIGATION_DRAWER_BODY)).toBeVisible();

    // 2. Click on the donate monthly button
    const newPagePromise = page.context().waitForEvent('page');
    await page.getByText('Become A Monthly Donor').click();

    // 3. Make sure a new tab is opened with the correct url
    const newPage = await newPagePromise;
    await newPage.waitForLoadState();
    await expect(newPage).toHaveURL(/give\.quran\.foundation\/give/);
  },
);

const drawerLinks = [
  // Event link
  { text: 'Ramadan 2026', href: '/ramadan2026', target: '' },

  // Main Navigation Links
  { text: 'Read', href: '', target: '' },
  { text: 'Learn', href: '/learning-plans', target: '' },
  { text: 'My Quran', href: '/my-quran', target: '' },
  { text: 'Quran Radio', href: '/radio', target: '' },
  { text: 'Reciters', href: '/reciters', target: '' },
  { text: 'About Us', href: '/about-us', target: '' },

  // More
  { text: 'Developers', href: '/developers', target: '' },
  { text: 'Product Updates', href: '/product-updates', target: '' },
  { text: 'Feedback', href: 'https://feedback.quran.com/', target: '_blank' },
  { text: 'Help', href: '/support', target: '' },

  // Our Projects
  { text: 'Quran.com', href: 'https://quran.com', target: '_blank' },
  {
    text: 'Quran For Android',
    href: '',
    target: '_blank',
  },
  {
    text: 'Quran iOS',
    href: '',
    target: '_blank',
  },
  { text: 'QuranReflect.com', href: 'https://quranreflect.com/', target: '_blank' },
  { text: 'Sunnah.com', href: 'https://sunnah.com/', target: '_blank' },
  { text: 'Nuqayah.com', href: 'https://nuqayah.com/', target: '_blank' },
  { text: 'Legacy.quran.com', href: 'https://legacy.quran.com', target: '_blank' },
  { text: 'Corpus.quran.com', href: 'https://corpus.quran.com', target: '_blank' },

  // Fundraising Banner Links
  {
    text: 'Become A Monthly Donor',
    href: 'https://give.quran.foundation/give/474400/#!/donation/checkout',
    target: '_blank',
  },
];
