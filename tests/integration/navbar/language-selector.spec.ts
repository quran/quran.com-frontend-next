import { test, expect } from '@playwright/test';

import {
  openNavigationDrawerLanguageSelector,
  selectNavigationDrawerLanguage,
} from '@/tests/helpers/language';
import languages from '@/tests/mocks/languages';
import Homepage from '@/tests/POM/home-page';
import { TestId } from '@/tests/test-ids';

let homePage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);
  await homePage.goTo('/');
});

test(
  'Clicking on Nav bar language selector icon should open the language selector menu',
  { tag: ['@nav', '@language', '@fast', '@smoke'] },
  async ({ page }) => {
    // 1. Make sure the language container is not visible initially
    await expect(page.getByTestId(TestId.LANGUAGE_CONTAINER)).not.toBeVisible();

    // 2. Open the language selector
    const languageContainer = await openNavigationDrawerLanguageSelector(page);

    // 5. Make sure all language selector items are visible (scoped to language container)
    await Promise.all(
      languages.map(async (language) => {
        await expect(languageContainer.getByRole('button', { name: language })).toBeVisible();
      }),
    );
  },
);

test(
  'Choosing a language should navigate the user to the localized page of that language',
  { tag: ['@nav', '@language', '@slow'] },
  async ({ page }) => {
    // 1. Make sure we are on the English version
    await expect(page).toHaveURL('/');

    // 2. Select the Bengali language and wait for navigation
    await Promise.all([selectNavigationDrawerLanguage(page, 'bn'), page.waitForURL('/bn')]);
  },
);

test(
  'Choosing a language should persist and HTML lang attribute should be updated',
  { tag: ['@nav', '@language', '@slow'] },
  async ({ page, baseURL }) => {
    // 1. Make sure the lang attribute is set to en initially
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');

    // 2. Select Arabic and wait for navigation
    await Promise.all([selectNavigationDrawerLanguage(page, 'ar'), page.waitForURL('/ar')]);

    // 6. Make sure the lang attribute is updated to ar
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');

    // 7. Navigate to root again
    await page.goto('/');

    // 8. Make sure the user is redirected to /ar (language persistence)
    expect(page.url()).toBe(`${baseURL}/ar`);
  },
);
