import { expect, type Page } from '@playwright/test';

/**
 * Extract the current locale from the page URL.
 * @param {Page} page - The Playwright page object
 * @returns {string} The current locale code (e.g., "en", "ar", "fr")
 */
const getCurrentLocale = (page: Page): string => {
  const url = page.url();
  const { pathname } = new URL(url);

  // Check if pathname starts with a two-letter locale code
  const localeMatch = pathname.match(/^\/([a-z]{2})(\/|$)/);
  if (localeMatch) {
    return localeMatch[1];
  }

  // Default to English if no locale prefix found
  return 'en';
};

/**
 * Switch the application language by opening the burger menu,
 * clicking the language selector, and selecting the specified locale.
 * @param {Page} page - The Playwright page object
 * @param {string} locale - The locale code to switch to (e.g., "en", "ar", "fr")
 * @returns {Promise<void>}
 */
const switchLanguage = async (page: Page, locale: string): Promise<void> => {
  // Check if we're already on the target locale
  const currentLocale = getCurrentLocale(page);
  if (currentLocale === locale) {
    return;
  }

  // Open the burger menu (navigation drawer)
  const burgerMenuButton = page.getByTestId('open-navigation-drawer');
  await expect(burgerMenuButton).toBeVisible();
  await burgerMenuButton.click();

  const navigationDrawer = page.getByTestId('navigation-drawer');
  await expect(navigationDrawer).toBeVisible();

  // Click on the language selector button
  const languageSelectorButton = page.getByTestId('language-selector-button');
  await expect(languageSelectorButton).toBeVisible();
  await languageSelectorButton.click();

  // Click on the specific language item and wait for URL to update
  const languageItem = page.getByTestId(`language-item-${locale}`);
  await expect(languageItem).toBeVisible();

  if (locale !== 'en') {
    // Non-English: URL pathname should start with /{locale}
    await Promise.all([
      languageItem.click(),
      page.waitForURL((url) => url.pathname.startsWith(`/${locale}`)),
    ]);
  } else {
    // English: URL pathname should not have locale prefix
    await Promise.all([
      languageItem.click(),
      page.waitForURL((url) => {
        const { pathname } = url;
        return pathname === '/' || !/^\/[a-z]{2}(\/|$)/.test(pathname);
      }),
    ]);
  }

  await expect(navigationDrawer).not.toBeVisible({ timeout: 5000 });
};

export default switchLanguage;
