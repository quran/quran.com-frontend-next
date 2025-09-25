import { test, expect } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';

let homePage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);
  await homePage.goTo();
});

test('Clicking on Nav bar language selector icon should open the language selector menu', async ({
  page,
}) => {
  // 1. make sure the language selector items are not visible
  await expect(page.getByRole('menuitem', { name: 'English' })).not.toBeVisible();
  // 2. Click on the language selector nav bar trigger
  await page.getByTestId('language-selector-button').click();
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
}) => {
  // 1. Make sure we are on the English version
  await expect(page).toHaveURL('/');
  // 2. Open the language selector menu
  await page.getByTestId('language-selector-button').click();
  // 3. select the Bengali language and make sure we are navigated to /bn
  await Promise.all([
    page.getByRole('menuitem', { name: 'বাংলা' }).click(),
    page.waitForURL('/bn'),
  ]);
});

test('Choosing a language should persist', async ({ page }) => {
  // 1. Open the language selector menu (use same selector que les autres tests)
  await page.getByTestId('language-selector-button').click();

  // 2. select Arabic and wait for navigation to /ar
  await Promise.all([
    page.waitForURL('**/ar'),
    page.getByRole('menuitem', { name: 'العربية' }).click(),
  ]);

  await page.waitForTimeout(2000); // wait a bit for the page to settle after the language change

  // 3. Navigate again to / and assert redirect/persistence to /ar
  await page.goto('/');
  await expect(page).toHaveURL(/\/ar/);
});
