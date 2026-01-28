import { expect, type Locator, type Page } from '@playwright/test';

import { openNavigationDrawer } from '@/tests/helpers/navigation';
import { getLanguageItemTestId, TestId } from '@/tests/test-ids';

export const openNavigationDrawerLanguageSelector = async (page: Page): Promise<Locator> => {
  await openNavigationDrawer(page);
  await page.getByTestId(TestId.LANGUAGE_SELECTOR_BUTTON).click();

  const languageContainer = page.getByTestId(TestId.LANGUAGE_CONTAINER);
  await expect(languageContainer).toBeVisible();
  return languageContainer;
};

export const selectNavigationDrawerLanguage = async (page: Page, locale: string): Promise<void> => {
  const languageContainer = await openNavigationDrawerLanguageSelector(page);
  await languageContainer.getByTestId(getLanguageItemTestId(locale)).click();
};

export const ensureEnglishLanguage = async (page: Page): Promise<void> => {
  const html = page.locator('html');
  const currentLang = await html.getAttribute('lang');
  if (currentLang === 'en') {
    return;
  }

  await selectNavigationDrawerLanguage(page, 'en');
  await expect(html).toHaveAttribute('lang', 'en');
};

export const ensureArabicLanguage = async (page: Page): Promise<void> => {
  const html = page.locator('html');
  const currentLang = await html.getAttribute('lang');
  if (currentLang === 'ar') {
    return;
  }

  await selectNavigationDrawerLanguage(page, 'ar');
  await expect(html).toHaveAttribute('lang', 'ar');
};
