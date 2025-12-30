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
    tag: ['@nav', '@language', '@fast', '@smoke'],
  },
  async ({ page }) => {
    // 1. make sure the language container is not visible
    await expect(page.getByTestId('language-container')).not.toBeVisible();
    // 2. Click on the menu
    await page.getByTestId('open-navigation-drawer').click();
    // 3. Click on the language selector nav bar trigger
    await page.getByTestId('language-selector-button').click();
    // 4. Grab the language container
    const languageContainer = page.getByTestId('language-container');
    // 5. Make sure all language selector items are visible (scoped to language container)
    await Promise.all(
      languages.map(async (language) => {
        await expect(languageContainer.getByRole('button', { name: language })).toBeVisible();
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
    // 2. Click on the menu
    await page.getByTestId('open-navigation-drawer').click();
    // 3. Click on the language selector nav bar trigger
    await page.getByTestId('language-selector-button').click();
    // 4. Grab the language container
    const languageContainer = page.getByTestId('language-container');
    // 5. select the Bengali language and make sure we are navigated to /bn
    await Promise.all([
      languageContainer.getByRole('button', { name: 'বাংলা' }).click(),
      page.waitForURL('/bn'),
    ]);
  },
);

test(
  'HTML lang attribute is set correctly based on the selected language',
  { tag: ['@nav', '@language', '@slow'] },
  async ({ page }) => {
    // 1. Make sure the lang attribute is set to en on the homepage
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    // 2. Click on the menu
    await page.getByTestId('open-navigation-drawer').click();
    // 3. Click on the language selector nav bar trigger
    await page.getByTestId('language-selector-button').click();
    // 4. Grab the language container
    const languageContainer = page.getByTestId('language-container');
    // 5. select French and wait for navigation to /fr
    await Promise.all([
      languageContainer.getByRole('button', { name: 'Français' }).click(),
      page.waitForURL('**/fr', { waitUntil: 'networkidle' }),
    ]);

    // 6. Make sure the lang attribute is set to fr
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  },
);
