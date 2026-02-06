import { test, expect } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';

let homePage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);
  await homePage.goTo('/1');
});

test('Guest sign-in prompt appears and redirect includes r param', async ({ page }) => {
  const firstVerse = page.getByTestId('verse-1:1');
  await firstVerse.getByLabel('Bookmark').click();
  const newCollectionButton = page.getByRole('button', { name: 'New Collection' });
  await expect(newCollectionButton).toBeVisible();
  await newCollectionButton.click();
  // Use a more specific selector to target the actual sign-in button (not the reading bookmark section)
  const signInButton = page.locator('button[type="button"]').filter({ hasText: /^Sign in$/ });
  await expect(signInButton).toBeVisible();
  await signInButton.click();
  await expect(page).toHaveURL(/\/login/);
  const url = new URL(page.url());
  const r = url.searchParams.get('r');
  expect(r && r.length > 0).toBe(true);
});
