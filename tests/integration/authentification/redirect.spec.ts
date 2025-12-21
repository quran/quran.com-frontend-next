/* eslint-disable no-script-url */
/* eslint-disable react-func/max-lines-per-function */
import { test, expect, Page } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';

let homePage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);
});

/**
 * Helper function to fill in the login form with test credentials
 */
const fillInLoginForm = async (page: Page) => {
  test.skip(
    !process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD,
    'No credentials provided',
  );

  await page.getByPlaceholder('Email address').fill(process.env.TEST_USER_EMAIL || '');
  await page.getByPlaceholder('Password').fill(process.env.TEST_USER_PASSWORD || '');
};

/**
 * Helper function to perform login and wait for redirect
 */
const performLogin = async (page: Page) => {
  await fillInLoginForm(page);
  await page.locator('form').getByRole('button', { name: 'Sign in' }).click();
};

test.describe('Authentication Redirect Parameter', () => {
  test(
    'redirects to original page after login when redirectTo parameter is present',
    { tag: ['@auth', '@redirect', '@smoke'] },
    async ({ page }) => {
      // Navigate to login with a valid redirect parameter pointing to a chapter page
      const targetPath = '/2'; // Chapter 2 (Al-Baqarah)
      await homePage.goTo(`/login?r=${encodeURIComponent(targetPath)}`);

      // Perform login
      await performLogin(page);

      // Should be redirected to the target page (chapter 2)
      await page.waitForURL(new RegExp(`${targetPath}$`));
      await expect(page).toHaveURL(new RegExp(`${targetPath}$`));

      // Verify we're authenticated by checking for profile avatar
      const profileAvatarButton = page.getByTestId('profile-avatar-button');
      await expect(profileAvatarButton.first()).toBeVisible();
    },
  );

  test(
    'redirects to home page after login when no redirectTo parameter is provided',
    { tag: ['@auth', '@redirect', '@smoke'] },
    async ({ page }) => {
      // Navigate to login without any redirect parameter
      await homePage.goTo('/login');

      // Perform login
      await performLogin(page);

      // Should be redirected to home page (with locale)
      await page.waitForURL(/\/[a-z]{2}?$/);
      await expect(page).toHaveURL(/\/[a-z]{2}?$/);

      // Verify we're authenticated by checking for profile avatar
      const profileAvatarButton = page.getByTestId('profile-avatar-button');
      await expect(profileAvatarButton.first()).toBeVisible();
    },
  );

  test(
    'handles relative path redirects correctly',
    { tag: ['@auth', '@redirect'] },
    async ({ page }) => {
      // Test with a relative path to search page
      const relativePath = '/search?query=light';
      await homePage.goTo(`/login?r=${encodeURIComponent(relativePath)}`);

      // Perform login
      await performLogin(page);

      // Should be redirected to the search page with query
      await page.waitForURL(/search\?query=light/);
      await expect(page).toHaveURL(/search\?query=light/);

      // Verify we're authenticated
      const profileAvatarButton = page.getByTestId('profile-avatar-button');
      await expect(profileAvatarButton.first()).toBeVisible();
    },
  );

  test(
    'handles complex relative paths with multiple query parameters',
    { tag: ['@auth', '@redirect'] },
    async ({ page }) => {
      // Test with a complex path including multiple query parameters
      const complexPath = '/1?translations=131,20&reciter=7';
      await homePage.goTo(`/login?r=${encodeURIComponent(complexPath)}`);

      // Perform login
      await performLogin(page);

      // Should be redirected to chapter 1 with the specified translations and reciter
      await page.waitForURL(/\/1\?.*translations=131,20.*reciter=7/);
      await expect(page).toHaveURL(/\/1\?.*translations=131,20.*reciter=7/);

      // Verify we're authenticated
      const profileAvatarButton = page.getByTestId('profile-avatar-button');
      await expect(profileAvatarButton.first()).toBeVisible();
    },
  );
});
