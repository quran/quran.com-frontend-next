import { expect, test } from '@playwright/test';

import drawerLinks from '@/tests/mocks/drawer';
import Homepage from '@/tests/POM/home-page';

let homePage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);
  await homePage.goTo('/');
});

test(
  'Navigation drawer icon should open the drawer when clicked',
  { tag: ['@fast', '@drawer'] },
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

    // 3. Click on the close drawer button
    await page.getByLabel('Close Drawer').first().click();

    // 4. Make sure the navigation drawer is no longer visible after closing it
    await expect(page.getByTestId('navigation-drawer-body')).not.toBeVisible();
  },
);

test(
  'Clicking outside the drawer should close it',
  { tag: ['@fast', '@drawer'] },
  async ({ page }) => {
    // 1. Open the navigation menu drawer
    await page.getByTestId('open-navigation-drawer').click();

    // 2. Click outside the drawer
    await page.click('body');

    // 3. Make sure the navigation drawer is no longer visible
    await expect(page.getByTestId('navigation-drawer-body')).not.toBeVisible();
  },
);

test(
  'Functional navigation links in the drawer',
  { tag: ['@fast', '@drawer'] },
  async ({ page }) => {
    // Open the navigation drawer
    await page.getByTestId('open-navigation-drawer').click();
    await expect(page.getByTestId('navigation-drawer-body')).toBeVisible();

    // Check that the links in the drawer are working
    const drawer = page.getByTestId('navigation-drawer-body');
    const allLinks = drawer.locator('a');

    await Promise.all(
      (
        await allLinks.all()
      ).map(async (link) => {
        const text = (await link.textContent())?.trim() || '';
        const href = (await link.getAttribute('href')) || '';
        const target = (await link.getAttribute('target')) || '';

        const expectedLink = drawerLinks.find((l) => l.text === text);

        expect(
          expectedLink,
          `Link with text "${text}" should be in the expected links`,
        ).toBeDefined();

        if (expectedLink) {
          // I did not put the links to the app stores in the drawerLinks mock because they may change
          if (expectedLink.href) {
            expect(href, `Link with text "${text}" should have href "${expectedLink?.href}"`).toBe(
              expectedLink.href,
            );
          }
          expect(
            target,
            `Link with text "${text}" should have target "${expectedLink?.target}"`,
          ).toBe(expectedLink.target);
        }
      }),
    );
  },
);

test(
  'Android and iOS app links are correct (the links should open the application store pages)',
  { tag: ['@slow', '@drawer'] },
  async ({ page, isMobile }) => {
    test.skip(
      isMobile,
      'This test is skipped on mobile due to a playwright bug when opening a playstore link.',
    );

    // Open the navigation drawer
    await page.getByTestId('open-navigation-drawer').click();
    await expect(page.getByTestId('navigation-drawer-body')).toBeVisible();

    const drawer = page.getByTestId('navigation-drawer-body');
    const androidLink = await drawer
      .getByRole('link', { name: 'Quran For Android' })
      .getAttribute('href');
    const iosLink = await drawer.getByRole('link', { name: 'Quran iOS' }).getAttribute('href');

    await page.goto(androidLink || '');
    await expect(page.getByText('Quran for Android').first()).toBeVisible();

    await page.goto(iosLink || '');
    await expect(page.getByText('Quran - by Quran.com').first()).toBeVisible();
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
    await page.getByText('Donate monthly').click();

    // 3. Make sure a new tab is opened with the correct url
    const newPage = await page.context().waitForEvent('page');
    await newPage.waitForLoadState();
    await expect(newPage).toHaveURL(/give\.quran\.foundation\/give/);
  },
);
