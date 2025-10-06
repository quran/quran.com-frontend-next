import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('Clicking on Nav bar language selector icon should open the language selector menu', async ({
  page,
}) => {
  // 1. Make sure the language selector items are not visible
  await expect(page.getByRole('menuitem', { name: 'English' })).not.toBeVisible();
  // 2. Click on the language selector nav bar trigger
  await page.locator('[aria-label="Select Language"]').click();
  // 3. Make sure the language selector items are visible
  await expect(page.getByRole('menuitem', { name: 'English' })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'العربية' })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'বাংলা' })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'فارسی' })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'Français' })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'Italiano' })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'Dutch' })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'Português' })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'русский' })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'Shqip' })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'ภาษาไทย' })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'Türkçe' })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'اردو' })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: '简体中文' })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'Melayu' })).toBeVisible();
});

test('Choosing a language should navigate the user to the localized page of that language', async ({
  page,
  baseURL,
}) => {
  // 1. Make sure we are on the English version
  await expect(page).toHaveURL('/');
  // 2. Open the language selector menu
  await page.locator('[aria-label="Select Language"]').click();
  // 3. Select the Bengali language and make sure we are navigated to /bn
  await page.locator('text=বাংলা').click();
  await page.waitForURL('**/bn');
  expect(page.url()).toBe(`${baseURL}/bn`);
});

test('Choosing a language should persist', async ({ page, baseURL }) => {
  // 1. Open the language selector menu
  await page.locator('[aria-label="Select Language"]').click();
  // 2. Select the Arabic language and make sure we are navigated to /ar
  await page.locator('text=العربية').click();
  await page.waitForURL('**/ar');
  // 3. Navigate again to /
  await page.goto('/');
  // 4. Make sure the user is redirected to /ar
  expect(page.url()).toBe(`${baseURL}/ar`);
});
