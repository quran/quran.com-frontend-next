/* eslint-disable react-func/max-lines-per-function */
import { test, expect } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';

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

    // 1. Open the language selector menu
    await page.getByTestId('language-selector-button-navbar').click();

    // 2. select Arabic and wait for navigation to /ar
    await Promise.all([
      page.waitForURL('**/ar', { waitUntil: 'networkidle' }),
      page.getByRole('menuitem', { name: 'العربية' }).click(),
    ]);

    // 3. Make sure the html dir attribute is set to rtl
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  },
);

test(
  'Surah name are displayed in the selected language on the homepage',
  { tag: ['@language', '@slow'] },
  async ({ page }) => {
    // 1. Open the language selector menu
    await page.getByTestId('language-selector-button-navbar').click();

    // 2. select Spanish and wait for navigation to /es
    await Promise.all([
      page.waitForURL('**/es', { waitUntil: 'networkidle' }),
      page.getByRole('menuitem', { name: 'Español' }).click(),
    ]);

    const surah108 = page.getByTestId('chapter-108-container');

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
  async ({ page }) => {
    // 1. Open the language selector menu
    await page.getByTestId('language-selector-button-navbar').click();

    // 2. Select French and wait for navigation to /fr
    await Promise.all([
      page.waitForURL('**/fr', { waitUntil: 'networkidle' }),
      page.getByRole('menuitem', { name: 'Français' }).click(),
    ]);

    // 3. Make sure some UI elements are displayed in French
    await expect(page.getByTestId('open-search-drawer')).toHaveAttribute(
      'aria-label',
      'Rechercher',
    );
    await expect(page.locator('#searchQuery')).toHaveAttribute(
      'placeholder',
      'Rechercher dans le Coran...',
    );

    await homePage.goTo('/fr/1');

    // Open the settings drawer and check some elements are in French
    await homePage.openSettingsDrawer();

    const settingsBody = page.getByTestId('settings-drawer-container');

    await expect(settingsBody).toBeVisible();

    const settingsText = (await settingsBody.evaluate((el) => el.textContent)) || '';
    expect(settingsText).toContain('Paramètres');

    // Close the settings drawer
    await page.keyboard.press('Escape');

    // Open the menu drawer and check some elements are in French
    await page.getByTestId('open-navigation-drawer').click();

    const navigationDrawer = page.getByTestId('navigation-drawer-body');
    const navText = (await navigationDrawer.evaluate((el) => el.textContent)) || '';
    expect(navText).toContain('Devenir un donateur mensuel');
    expect(navText).toContain('Accueil');
    expect(navText).toContain('À propos de nous');
  },
);

test(
  'Selecting a language should set the default translation for verse to a popular one for that language',
  {
    tag: ['@nav', '@language', '@slow'],
  },
  async ({ page }) => {
    await page.getByTestId('language-selector-button-navbar').click();

    // Select French and wait for navigation to /fr
    await Promise.all([
      page.waitForURL('**/fr', { waitUntil: 'networkidle' }),
      page.getByRole('menuitem', { name: 'Français' }).click(),
    ]);

    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');

    // Navigate to surah Al-Fatiha
    await Promise.all([
      page.waitForURL('**/fr/1'),
      page.getByTestId('chapter-1-container').click(),
    ]);

    const firstVerse = page.getByTestId('verse-1:3');
    // Make sure the translation in French is visible
    await expect(
      firstVerse.getByText('le Tout Miséricordieux, le Très Miséricordieux'),
    ).toBeVisible();
    // Make sure Isa Garcia translation is selected in the settings
    await homePage.openSettingsDrawer();
    const translationSelect = page.getByTestId('Traductions sélectionnées Card');
    await expect(translationSelect).toBeVisible();
    await expect(translationSelect).toContainText('Muhammad Hamidullah');
  },
);
