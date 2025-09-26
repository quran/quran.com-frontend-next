import { test, expect } from '@playwright/test';

import languages from '@/tests/mocks/languages';
import Homepage from '@/tests/POM/home-page';

let homePage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);
  await homePage.goTo();
});

test(
  'Language selector in the navbar opens and displays all languages',
  {
    tag: ['@nav', '@language', '@fast'],
  },
  async ({ page }) => {
    // 1. make sure the language selector items are not visible
    await expect(page.getByRole('menuitem', { name: 'English' })).not.toBeVisible();
    // 2. Click on the language selector nav bar trigger
    await page.getByTestId('language-selector-button').click();
    // 3. Make sure all language selector items are visible
    await Promise.all(
      languages.map(async (language) => {
        await expect(page.getByRole('menuitem', { name: language })).toBeVisible();
      }),
    );
  },
);

test(
  'Language selector in the footer opens and displays all languages',
  { tag: ['@footer', '@language', '@fast'] },
  async ({ page }) => {
    const footer = page.locator('footer');
    const languageSelector = footer.getByTestId('language-selector');
    await expect(languageSelector).toBeVisible();

    await languageSelector.locator('button').click();

    await Promise.all(
      languages.map(async (language) => {
        await expect(languageSelector.getByRole('menuitem', { name: language })).toBeVisible();
      }),
    );

    // I do not verify the navigation here as it's already covered in the nav bar language selector tests
    // (it uses the same component)
  },
);

test(
  'Choosing a language should navigate the user to the localized page of that language',
  {
    tag: ['@nav', '@language', '@slow'],
  },
  async ({ page }) => {
    // 1. Make sure we are on the English version
    await expect(page).toHaveURL('/');
    // 2. Open the language selector menu
    await page.getByTestId('language-selector-button').click();
    // 3. select the Bengali language and make sure we are navigated to /bn
    await Promise.all([
      page.getByRole('menuitem', { name: 'বাংলা' }).click(),
      page.waitForURL('/bn'),
    ]);
  },
);

test(
  'Choosing a language should persist (though the navbar)',
  {
    tag: ['@nav', '@language', '@slow'],
  },
  async ({ page }) => {
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
  },
);
