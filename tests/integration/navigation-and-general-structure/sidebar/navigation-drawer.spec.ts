/* eslint-disable no-await-in-loop */
import { expect, test } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';

let homePage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);
  await homePage.goTo('/');
});

test(
  'Navigation drawer icon should open the drawer when clicked',
  { tag: ['@fast', '@drawer', '@smoke'] },
  async ({ page }) => {
    // Make sure the navigation drawer is not visible before opening it
    await expect(page.getByTestId('navigation-drawer-body')).not.toBeVisible();

    // Click to open the drawer
    await page.getByTestId('open-navigation-drawer').click();

    // Verify that the drawer is now visible
    await expect(page.getByTestId('navigation-drawer-body')).toBeVisible();
  },
);

test(
  'Navigation drawer close icon should close the drawer',
  { tag: ['@fast', '@drawer'] },

  async ({ page }) => {
    // 1. Open the navigation menu drawer
    await page.getByTestId('open-navigation-drawer').click();

    // 2. Make sure the navigation drawer is visible after opening it
    await expect(page.getByTestId('navigation-drawer-body')).toBeVisible();
    const navigationDrawer = page.getByTestId('navigation-drawer');

    // 3. Click on the close drawer button
    await navigationDrawer.getByLabel('Close Drawer').click();

    // 4. Make sure the navigation drawer is no longer visible after closing it
    await expect(page.getByTestId('navigation-drawer-body')).not.toBeVisible();
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
    await page.getByTestId('open-navigation-drawer').click();

    // 2. Click outside the drawer
    await page.click('body');

    // 3. Make sure the navigation drawer is no longer visible
    await expect(page.getByTestId('navigation-drawer-body')).not.toBeVisible();
  },
);

test('Functional navigation links in the drawer', { tag: ['@drawer'] }, async ({ page }) => {
  // Open the navigation drawer
  await page.getByTestId('open-navigation-drawer').click();
  await expect(page.getByTestId('navigation-drawer-body')).toBeVisible();

  // Check that the links in the drawer are working
  const drawer = page.getByTestId('navigation-drawer-body');
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
    await page.getByTestId('open-navigation-drawer').click();
    await expect(page.getByTestId('navigation-drawer-body')).toBeVisible();

    const drawer = page.getByTestId('navigation-drawer-body');
    await page.getByTestId('navigation-links-our-projects').click();
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
    await page.getByTestId('open-navigation-drawer').click();

    // Wait for the drawer body to be fully visible
    await expect(page.getByTestId('navigation-drawer-body')).toBeVisible();

    // 2. Click on the donate monthly button
    await page.getByText('Become A Monthly Donor').click();

    // 3. Make sure a new tab is opened with the correct url
    const newPage = await page.context().waitForEvent('page');
    await newPage.waitForLoadState();
    await expect(newPage).toHaveURL(/donate\.quran\.foundation/);
  },
);

const drawerLinks = [
  // Main Navigation Links
  { text: 'Read', href: '', target: '' },
  { text: 'Learn', href: '/learning-plans', target: '' },
  { text: 'My Quran', href: '/profile', target: '' },
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
  { text: 'Become A Monthly Donor', href: 'https://donate.quran.foundation', target: '_blank' },
];
