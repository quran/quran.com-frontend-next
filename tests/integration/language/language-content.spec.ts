/* eslint-disable react-func/max-lines-per-function */
import { test, expect } from '@playwright/test';

import { selectNavigationDrawerLanguage } from '@/tests/helpers/language';
import { openNavigationDrawer } from '@/tests/helpers/navigation';
import { closeSettingsDrawer } from '@/tests/helpers/settings';
import Homepage from '@/tests/POM/home-page';
import { getChapterContainerTestId, getVerseTestId, TestId } from '@/tests/test-ids';

let homePage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);
  await homePage.goTo();
});

test(
  'Arabic language selector makes the page RTL',
  { tag: ['@language', '@slow'] },
  async ({ page }) => {
    await expect(page.locator('html')).not.toHaveAttribute('dir', 'rtl');

    // 1. Click on the menu
    await homePage.closeNextjsErrorDialog();
    await openNavigationDrawer(page);
    await homePage.closeNextjsErrorDialog();
    // 2. select Arabic and wait for navigation to /ar
    await Promise.all([
      selectNavigationDrawerLanguage(page, 'ar'),
      page.waitForURL('**/ar', { waitUntil: 'networkidle' }),
    ]);

    // 5. Make sure the html dir attribute is set to rtl
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  },
);

test(
  'Surah name are displayed in the selected language on the homepage',
  { tag: ['@language', '@slow'] },
  async ({ page }) => {
    // 1. Click on the menu
    await homePage.closeNextjsErrorDialog();
    await openNavigationDrawer(page);
    // 2. select Spanish and wait for navigation to /es
    await Promise.all([
      selectNavigationDrawerLanguage(page, 'es'),
      page.waitForURL('**/es', { waitUntil: 'networkidle' }),
    ]);

    const surah108 = page.getByTestId(getChapterContainerTestId(108));

    // Espanol translation of Al-Kawthar is Al-Káuzar
    await expect(surah108.getByText('Al-Káuzar')).toBeVisible();
    // Espanol translation of Al-Kawthar's english title "The Abundance of Good" is "La Abundancia de Bondad"
    await expect(surah108.getByText('La Abundancia de Bondad')).toBeVisible();
    // Espanol translation of ayah is aleyas
    await expect(surah108.getByText('3 Aleyas')).toBeVisible();
  },
);

test(
  'User interface is displayed in the selected language',
  { tag: ['@language', '@slow'] },
  async ({ page, isMobile }) => {
    // 1. Click on the menu
    await homePage.closeNextjsErrorDialog();
    await openNavigationDrawer(page);
    // 2. Select French and wait for navigation to /fr
    await Promise.all([
      selectNavigationDrawerLanguage(page, 'fr'),
      page.waitForURL('**/fr', { waitUntil: 'networkidle' }),
    ]);

    // 5. Make sure some UI elements are displayed in French
    await expect(page.getByTestId(TestId.OPEN_SEARCH_DRAWER)).toHaveAttribute(
      'aria-label',
      'Rechercher',
    );
    await expect(page.locator('#searchQuery')).toHaveAttribute(
      'placeholder',
      'Rechercher dans le Coran...',
    );

    await homePage.goTo('/fr/1');

    // Open the settings drawer and check some elements are in French
    await homePage.openSettingsDrawer(isMobile);

    const settingsBody = page.getByTestId(TestId.SETTINGS_DRAWER_BODY);

    await expect(settingsBody).toBeVisible();

    // Close the settings drawer
    await closeSettingsDrawer(page);

    // Open the menu drawer and check some elements are in French
    await openNavigationDrawer(page);

    const navigationDrawer = page.getByTestId(TestId.NAVIGATION_DRAWER_BODY);
    const navText = (await navigationDrawer.evaluate((el) => el.textContent)) || '';
    expect(navText).toContain('Devenir un donateur mensuel');
  },
);

test(
  'Selecting a language should set the default translation for verse to a popular one for that language',
  {
    tag: ['@nav', '@language', '@slow'],
  },
  async ({ page }) => {
    // 1. Click on the menu
    await openNavigationDrawer(page);
    // 2. Select French and wait for navigation to /fr
    await Promise.all([
      selectNavigationDrawerLanguage(page, 'fr'),
      page.waitForURL('**/fr', { waitUntil: 'networkidle' }),
    ]);

    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');

    // Navigate to surah Al-Fatiha
    await Promise.all([
      page.waitForURL('**/fr/1'),
      page.getByTestId(getChapterContainerTestId(1)).click(),
    ]);

    const firstVerse = page.getByTestId(getVerseTestId('1:3'));
    // Make sure the translation in French is visible
    await expect(
      firstVerse.getByText('le Tout Miséricordieux, le Très Miséricordieux'),
    ).toBeVisible();
    // Make sure Isa Garcia translation is selected in the settings
    await homePage.openSettingsDrawer();
    const translationSelect = page.getByTestId(TestId.TRANSLATIONS_SELECTED_CARD);
    await expect(translationSelect).toBeVisible();
    await expect(translationSelect).toContainText('Muhammad Hamidullah');
  },
);
