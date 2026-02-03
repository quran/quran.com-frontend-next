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
const WORD_BY_WORD_TOOLTIP_TRANSLATION_ID = 'wbw-translation';
const WORD_BY_WORD_TOOLTIP_TRANSLITERATION_ID = 'wbw-transliteration';
const WORD_BY_WORD_INLINE_TRANSLATION_ID = 'inline-translation';
const WORD_BY_WORD_INLINE_TRANSLITERATION_ID = 'inline-transliteration';

const scrollToWordByWordInlineSection = async (page: Page): Promise<void> => {
  const settingsBody = page.getByTestId(TestId.SETTINGS_DRAWER_BODY);
  if (await settingsBody.count()) {
    await settingsBody.evaluate((node) => {
      // eslint-disable-next-line no-param-reassign
      node.scrollTop = node.scrollHeight;
    });
  }
};

const isCheckboxChecked = async (locator: Locator): Promise<boolean> => {
  if ((await locator.count()) === 0) {
    return false;
  }

  return locator.isChecked();
};

const setCheckboxValue = async (locator: Locator, enabled: boolean): Promise<void> => {
  // Wait for the checkbox to be attached first
  await locator.waitFor({ state: 'attached', timeout: 10000 });

  const label = locator.locator('xpath=ancestor::label[1]');
  await label.scrollIntoViewIfNeeded();

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const isChecked = await locator.isChecked();
    if (isChecked === enabled) {
      return;
    }

    // Try the label first (handles visually hidden inputs), then fall back to the input itself.
    if (attempt === 0) {
      await label.click({ force: true });
    } else {
      await locator.click({ force: true });
    }

    await locator.page().waitForTimeout(300);
  }

  // Fallback: directly toggle the input and dispatch change/input events.
  const isChecked = await locator.isChecked();
  if (isChecked !== enabled) {
    await locator.evaluate((node, shouldCheck) => {
      const input = node as HTMLInputElement;
      input.checked = shouldCheck;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }, enabled);
  }

  await expect(locator).toBeChecked({ checked: enabled, timeout: 15000 });
};

const isInlineDisplayConfigured = async (page: Page): Promise<boolean> => {
  const inlineTranslationToggle = page.locator(`#${WORD_BY_WORD_INLINE_TRANSLATION_ID}`);
  const inlineTransliterationToggle = page.locator(`#${WORD_BY_WORD_INLINE_TRANSLITERATION_ID}`);

  const [isTranslationChecked, isTransliterationChecked] = await Promise.all([
    isCheckboxChecked(inlineTranslationToggle),
    isCheckboxChecked(inlineTransliterationToggle),
  ]);

  return isTranslationChecked || isTransliterationChecked;
};

export const openSettingsDrawer = async (
  page: Page,
  options: SettingsDrawerOptions = {},
): Promise<void> => {
  const { isMobile = false } = options;

  await page.waitForTimeout(1000);
  let buttons = page.getByTestId(TestId.SETTINGS_BUTTON);

  if (isMobile) {
    await page.mouse.wheel(0, 500);
    await page.mouse.wheel(0, -300);
  }

  if ((await buttons.count()) === 0) {
    const currentUrl = page.url();
    let localePrefix: string | null = null;
    try {
      const { pathname } = new URL(currentUrl);
      const match = pathname.match(/^\/([a-z]{2})(?:\/|$)/);
      localePrefix = match?.[1] || null;
    } catch {
      localePrefix = null;
    }

    const candidateUrls = [
      ...(localePrefix ? [`/${localePrefix}/1`] : []),
      '/en/1',
      '/1',
    ];

    for (const url of candidateUrls) {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      // The QuranReader context menu (which contains the settings button) renders only
      // after client-side state (lastReadVerseKey) is populated. The `header` test id
      // lives on the context menu wrapper and is a reliable "hydration complete" marker.
      try {
        await page
          .getByTestId(TestId.HEADER)
          .first()
          .waitFor({ state: 'visible', timeout: 30000 });
      } catch {
        // ignore - we still try to locate the button directly
      }
      buttons = page.getByTestId(TestId.SETTINGS_BUTTON);
      try {
        await expect(buttons).not.toHaveCount(0, { timeout: 30000 });
        break;
      } catch {
        // try next candidate
      }
    }
  }

  await expect(buttons).not.toHaveCount(0, { timeout: 30000 });
  const count = await buttons.count();
  for (let index = 0; index < count; index += 1) {
    const button = buttons.nth(index);
    try {
      await expect(button).toBeVisible({ timeout: 2000 });
      await button.click();
      await expect(page.getByTestId(TestId.SETTINGS_DRAWER_BODY)).toBeVisible({ timeout: 15000 });
      return;
    } catch {
      // Continue trying other buttons in case this one disappears
    }
  }

  throw new Error(`Unable to find a visible settings button. url=${page.url()}`);
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

  const translationSelect = settingsBody.getByTestId(TestId.TRANSLATION_SELECT);
  if (await translationSelect.isVisible().catch(() => false)) {
    return settingsBody;
  }

  // If we're already in the Translation view, the search input appears immediately (before data loads).
  const selectionCard = getTranslationsSelectionCard(settingsBody);
  await expect(selectionCard.first()).toBeVisible({ timeout: 30000 });
  await selectionCard.first().click();
  await expect(settingsBody.locator(`#${TRANSLATIONS_SEARCH_INPUT_ID}`)).toBeVisible({
    timeout: 30000,
  });

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
  await openSettingsDrawer(page, options);
  const translationTab = page.getByTestId(TestId.TRANSLATION_SETTINGS_TAB);
  if ((await translationTab.count()) > 0 && (await translationTab.first().isVisible())) {
    await translationTab.first().click();
  }

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
  await openSettingsDrawer(page, options);
  const translationTab = page.getByTestId(TestId.TRANSLATION_SETTINGS_TAB);
  if ((await translationTab.count()) > 0 && (await translationTab.first().isVisible())) {
    await translationTab.first().click();
  }

  const settingsBody = await openTranslationSettings(page, options);
  const translationCheckbox = settingsBody.locator(`[id="${translationId}"]`);
  await expect(translationCheckbox).toBeVisible();

  const isChecked = (await translationCheckbox.getAttribute('aria-checked')) === 'true';
  if (!isChecked) {
    await translationCheckbox.click();
  }

  await closeSettingsDrawer(page);
};

export const selectAnyTranslationPreference = async (
  page: Page,
  options: SettingsDrawerOptions = {},
): Promise<string> => {
  await openSettingsDrawer(page, options);
  const translationTab = page.getByTestId(TestId.TRANSLATION_SETTINGS_TAB);
  if ((await translationTab.count()) > 0 && (await translationTab.first().isVisible())) {
    await translationTab.first().click();
  }

  const settingsBody = await openTranslationSettings(page, options);
  const uncheckedTranslations = settingsBody.getByRole('checkbox', { checked: false });
  const translationCheckboxes = settingsBody.getByRole('checkbox');

  await expect(translationCheckboxes.first()).toBeVisible();
  const targetCheckbox =
    (await uncheckedTranslations.count()) > 0
      ? uncheckedTranslations.first()
      : translationCheckboxes.first();

  const targetId = await targetCheckbox.getAttribute('id');
  await targetCheckbox.click();

  await closeSettingsDrawer(page);

  if (!targetId) {
    throw new Error('Unable to determine a translation id from settings.');
  }

  return targetId;
};

export const selectQuranFont = async (page: Page, font: SettingsQuranFont): Promise<void> => {
  // Ensure we are on the "Arabic" tab
  await page.getByTestId(TestId.ARABIC_SETTINGS_TAB).click();

  await page.getByTestId(getQuranFontButtonTestId(font)).click();
};

export const selectMushafLines = async (page: Page, lines: MushafLines): Promise<void> => {
  // Ensure we are on the "Arabic" tab
  await page.getByTestId(TestId.ARABIC_SETTINGS_TAB).click();

  const linesSelect = page.getByTestId(TestId.LINES);
  await expect(linesSelect).toBeVisible();
  await linesSelect.selectOption(lines);
};

export const setWordByWordLanguage = async (page: Page, locale: string): Promise<void> => {
  // Ensure we are on the "More" tab
  await page.getByTestId(TestId.MORE_SETTINGS_TAB).click();

  await page.getByTestId(TestId.WORD_BY_WORD).selectOption(locale);
};

export const setWordByWordDisplay = async (
  page: Page,
  display: WordByWordDisplay,
): Promise<void> => {
  // Ensure we are on the "More" tab
  await page.getByTestId(TestId.MORE_SETTINGS_TAB).click();

  if (display === WordByWordDisplay.INLINE) {
    await scrollToWordByWordInlineSection(page);
    const inlineTranslationToggle = page.locator(`#${WORD_BY_WORD_INLINE_TRANSLATION_ID}`);
    await expect(inlineTranslationToggle).toBeVisible({ timeout: 15000 });
    await setCheckboxValue(inlineTranslationToggle, true);
    return;
  }

  // Default to tooltip display: make sure below-word options are off and tooltip translation is on.
  await setCheckboxValue(page.locator(`#${WORD_BY_WORD_INLINE_TRANSLATION_ID}`), false);
  await setCheckboxValue(page.locator(`#${WORD_BY_WORD_INLINE_TRANSLITERATION_ID}`), false);
  await setCheckboxValue(page.locator(`#${WORD_BY_WORD_TOOLTIP_TRANSLATION_ID}`), true);
};

export const setWordByWordTranslationEnabled = async (
  page: Page,
  enabled: boolean,
): Promise<void> => {
  // Ensure we are on the "More" tab
  await page.getByTestId(TestId.MORE_SETTINGS_TAB).click();
  await scrollToWordByWordInlineSection(page);

  const tooltipTranslationToggle = page.locator(`#${WORD_BY_WORD_TOOLTIP_TRANSLATION_ID}`);
  await setCheckboxValue(tooltipTranslationToggle, enabled);

  // Keep inline translation in sync when below-word display is in use (or when disabling).
  if ((await isInlineDisplayConfigured(page)) || !enabled) {
    const inlineTranslationToggle = page.locator(`#${WORD_BY_WORD_INLINE_TRANSLATION_ID}`);
    await setCheckboxValue(inlineTranslationToggle, enabled);
  }
};

export const setWordByWordTransliterationEnabled = async (
  page: Page,
  enabled: boolean,
): Promise<void> => {
  // Ensure we are on the "More" tab
  await page.getByTestId(TestId.MORE_SETTINGS_TAB).click();
  await scrollToWordByWordInlineSection(page);

  const tooltipTransliterationToggle = page.locator(`#${WORD_BY_WORD_TOOLTIP_TRANSLITERATION_ID}`);
  await setCheckboxValue(tooltipTransliterationToggle, enabled);

  // Keep inline transliteration in sync when below-word display is in use (or when disabling).
  if ((await isInlineDisplayConfigured(page)) || !enabled) {
    const inlineTransliterationToggle = page.locator(`#${WORD_BY_WORD_INLINE_TRANSLITERATION_ID}`);
    await setCheckboxValue(inlineTransliterationToggle, enabled);
  }
};

export const setWordByWordTooltipEnabled = async (page: Page, enabled: boolean): Promise<void> => {
  // Ensure we are on the "More" tab
  await page.getByTestId(TestId.MORE_SETTINGS_TAB).click();

  await setCheckboxValue(page.locator(`#${WORD_BY_WORD_TOOLTIP_TRANSLATION_ID}`), enabled);

  if (!enabled) {
    await setCheckboxValue(page.locator(`#${WORD_BY_WORD_TOOLTIP_TRANSLITERATION_ID}`), false);

    if (await isInlineDisplayConfigured(page)) {
      await setCheckboxValue(page.locator(`#${WORD_BY_WORD_INLINE_TRANSLATION_ID}`), false);
      await setCheckboxValue(page.locator(`#${WORD_BY_WORD_INLINE_TRANSLITERATION_ID}`), false);
    }
  }
};
