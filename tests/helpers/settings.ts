/* eslint-disable no-await-in-loop */
import { expect, type Locator, type Page } from '@playwright/test';

import ThemeType from '@/redux/types/ThemeType';
import {
  getQuranFontButtonTestId,
  getThemeButtonTestId,
  type SettingsQuranFont,
  TestId,
} from '@/tests/test-ids';
import { type MushafLines, WordByWordDisplay } from '@/types/QuranReader';

export interface SettingsDrawerOptions {
  closeAfter?: boolean;
  isMobile?: boolean;
}

const TRANSLATIONS_SEARCH_INPUT_ID = 'translations-search';

const setCheckboxValue = async (locator: Locator, enabled: boolean): Promise<void> => {
  const label = locator.locator('..');
  await label.scrollIntoViewIfNeeded();

  const isChecked = await locator.isChecked();
  if (isChecked === enabled) {
    return;
  }

  await locator.click({ force: true });
  await locator.page().waitForTimeout(300);
  await expect(locator).toBeChecked({ checked: enabled, timeout: 5000 });
};

export const openSettingsDrawer = async (
  page: Page,
  options: SettingsDrawerOptions = {},
): Promise<void> => {
  const { isMobile = false } = options;

  await page.waitForTimeout(1000);
  const buttons = page.getByTestId(TestId.SETTINGS_BUTTON);

  if (isMobile) {
    await page.mouse.wheel(0, 500);
    await page.mouse.wheel(0, -300);
  }

  await expect(buttons).not.toHaveCount(0, { timeout: 10000 });
  const count = await buttons.count();
  for (let index = 0; index < count; index += 1) {
    const button = buttons.nth(index);
    try {
      await expect(button).toBeVisible({ timeout: 6000 });
      await button.click();
      return;
    } catch {
      // Continue trying other buttons in case this one disappears
    }
  }

  throw new Error('Unable to find a visible settings button.');
};

export const closeSettingsDrawer = async (page: Page): Promise<void> => {
  const drawerBody = page.getByTestId(TestId.SETTINGS_DRAWER_BODY);
  if (!(await drawerBody.isVisible())) {
    return;
  }

  const drawer = page.getByTestId(TestId.SETTINGS_DRAWER);
  const closeButton = drawer.getByRole('button', { name: /close drawer/i });
  if ((await closeButton.count()) > 0) {
    await closeButton.first().click();
  } else {
    await page.keyboard.press('Escape');
  }

  await expect(drawerBody).not.toBeVisible();
};

export const withSettingsDrawer = async (
  page: Page,
  settingsAction: (page: Page) => Promise<void>,
  options: SettingsDrawerOptions = {},
): Promise<void> => {
  const { closeAfter = true } = options;

  await openSettingsDrawer(page, options);
  await settingsAction(page);

  if (closeAfter) {
    await closeSettingsDrawer(page);
  }
};

const getTranslationsSelectionCard = (settingsBody: Locator): Locator => {
  return settingsBody.getByTestId(TestId.TRANSLATION_CARD);
};

const openTranslationSettings = async (
  page: Page,
  options: SettingsDrawerOptions = {},
): Promise<Locator> => {
  const settingsBody = page.getByTestId(TestId.SETTINGS_DRAWER_BODY);
  if (!(await settingsBody.isVisible())) {
    await openSettingsDrawer(page, options);
  }

  const translationSearch = settingsBody.locator(`#${TRANSLATIONS_SEARCH_INPUT_ID}`);
  if (await translationSearch.isVisible()) {
    return settingsBody;
  }

  const selectionCard = getTranslationsSelectionCard(settingsBody);
  await expect(selectionCard.first()).toBeVisible();
  await selectionCard.first().click();
  await expect(translationSearch).toBeVisible();

  return settingsBody;
};

export const selectTheme = async (page: Page, theme: ThemeType): Promise<void> => {
  await page.getByTestId(getThemeButtonTestId(theme)).first().click();
};

export const expectThemeSelected = async (page: Page, theme: ThemeType): Promise<void> => {
  await expect(page.getByTestId(getThemeButtonTestId(theme)).first()).toHaveAttribute(
    'data-is-selected',
    'true',
  );
};

export const changeWebsiteTheme = async (
  page: Page,
  theme: ThemeType,
  options: SettingsDrawerOptions = {},
): Promise<void> =>
  withSettingsDrawer(
    page,
    async () => {
      await selectTheme(page, theme);
    },
    options,
  );

export const clearSelectedTranslations = async (
  page: Page,
  options: SettingsDrawerOptions = {},
): Promise<string> => {
  const settingsBody = await openTranslationSettings(page, options);
  const translationCheckboxes = settingsBody.getByRole('checkbox');
  await expect(translationCheckboxes.first()).toBeVisible();

  const firstTranslationId = await translationCheckboxes.first().getAttribute('id');
  const checkedTranslations = settingsBody.getByRole('checkbox', { checked: true });
  let checkedCount = await checkedTranslations.count();

  while (checkedCount > 0) {
    await checkedTranslations.first().click();
    await expect(checkedTranslations).toHaveCount(checkedCount - 1);
    checkedCount = await checkedTranslations.count();
  }

  await closeSettingsDrawer(page);

  if (!firstTranslationId) {
    throw new Error('Unable to determine a translation id from settings.');
  }

  return firstTranslationId;
};

export const selectTranslationPreference = async (
  page: Page,
  translationId: string,
  options: SettingsDrawerOptions = {},
): Promise<void> => {
  const settingsBody = await openTranslationSettings(page, options);
  const translationCheckbox = settingsBody.locator(`[id="${translationId}"]`);
  await expect(translationCheckbox).toBeVisible();

  const isChecked = (await translationCheckbox.getAttribute('aria-checked')) === 'true';
  if (!isChecked) {
    await translationCheckbox.click();
  }

  await closeSettingsDrawer(page);
};

export const selectQuranFont = async (page: Page, font: SettingsQuranFont): Promise<void> => {
  await page.getByTestId(getQuranFontButtonTestId(font)).click();
};

export const selectMushafLines = async (page: Page, lines: MushafLines): Promise<void> => {
  const linesSelect = page.getByTestId(TestId.LINES);
  await expect(linesSelect).toBeVisible();
  await linesSelect.selectOption(lines);
};

export const setWordByWordLanguage = async (page: Page, locale: string): Promise<void> => {
  await page.getByTestId(TestId.WORD_BY_WORD).selectOption(locale);
};

export const setWordByWordDisplay = async (
  page: Page,
  display: WordByWordDisplay,
): Promise<void> => {
  const displayToggle = page.locator(`#${display}`);
  await setCheckboxValue(displayToggle, true);
};

export const setWordByWordTranslationEnabled = async (
  page: Page,
  enabled: boolean,
): Promise<void> => {
  await setCheckboxValue(page.locator('#wbw-translation'), enabled);
};

export const setWordByWordTransliterationEnabled = async (
  page: Page,
  enabled: boolean,
): Promise<void> => {
  await setCheckboxValue(page.locator('#wbw-transliteration'), enabled);
};

export const setWordByWordTooltipEnabled = async (page: Page, enabled: boolean): Promise<void> => {
  await setCheckboxValue(page.locator('#tooltip'), enabled);
};
