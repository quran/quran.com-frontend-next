import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('Clicking on Nav bar language selector icon should open the language selector menu', async ({
  page,
}) => {
  // 1. make sure the language selector items are not visible
  await expect(page.locator('div[role="menuitem"]:has-text("English")')).not.toBeVisible();
  // 2. Click on the language selector nav bar trigger
  await page.locator('[aria-label="Select Language"]').click();
  // 3. Make sure the language selector items are visible
  await expect(page.locator('div[role="menuitem"]:has-text("English")')).toBeVisible();
  await expect(page.locator('div[role="menuitem"]:has-text("العربية")')).toBeVisible();
  await expect(page.locator('div[role="menuitem"]:has-text("বাংলা")')).toBeVisible();
  await expect(page.locator('div[role="menuitem"]:has-text("فارسی")')).toBeVisible();
  await expect(page.locator('div[role="menuitem"]:has-text("Français")')).toBeVisible();
  await expect(page.locator('div[role="menuitem"]:has-text("Italiano")')).toBeVisible();
  await expect(page.locator('div[role="menuitem"]:has-text("Dutch")')).toBeVisible();
  await expect(page.locator('div[role="menuitem"]:has-text("Português")')).toBeVisible();
  await expect(page.locator('div[role="menuitem"]:has-text("русский")')).toBeVisible();
  await expect(page.locator('div[role="menuitem"]:has-text("Shqip")')).toBeVisible();
  await expect(page.locator('div[role="menuitem"]:has-text("ภาษาไทย")')).toBeVisible();
  await expect(page.locator('div[role="menuitem"]:has-text("Türkçe")')).toBeVisible();
  await expect(page.locator('div[role="menuitem"]:has-text("اردو")')).toBeVisible();
  await expect(page.locator('div[role="menuitem"]:has-text("简体中文")')).toBeVisible();
  await expect(page.locator('div[role="menuitem"]:has-text("Melayu")')).toBeVisible();
});

test('Choosing a language should navigate the user to the localized page of that language', async ({
  page,
}) => {
  // 1. Make sure we are on the English version
  await expect(page).toHaveURL('/');
  // 2. Open the language selector menu
  await page.locator('[aria-label="Select Language"]').click();
  // 3. select the Bengali language and make sure we are navigated to /bn
  await Promise.all([page.waitForNavigation({ url: '/bn' }), page.locator('text=বাংলা').click()]);
});

test('Choosing a language should persist', async ({ page, baseURL }) => {
  // 1. Open the language selector menu
  await page.locator('[aria-label="Select Language"]').click();
  // 2. select the Arabic language and make sure we are navigated to /ar
  await Promise.all([page.waitForNavigation({ url: '/ar' }), page.locator('text=العربية').click()]);
  // 3. Navigate again to /
  await page.goto('/');
  const currentUrl = page.url();
  // 4. Make sure the user is redirected to /ar
  expect(currentUrl).toBe(`${baseURL}/ar`);
});
