/**
 * Widget Embed - Functions for building iframe embed URLs and snippets.
 */

import { DEFAULTS } from './widget-defaults';
import type { Preferences, WidgetIframeConfig } from './widget-types';

import ThemeType from '@/redux/types/ThemeType';
import type ThemeTypeVariant from '@/redux/types/ThemeTypeVariant';

type BuildEmbedOptions = {
  omitDefaults?: boolean;
};

/**
 * Normalize width value, defaulting to 100%.
 *
 * @param {string} width - Raw width value.
 * @returns {string} Normalized width.
 */
const normalizeWidth = (width: string): string => width?.trim() || '100%';

/**
 * Normalize height value, defaulting to DEFAULTS.iframeHeight.
 *
 * @param {string} height - Raw height value.
 * @returns {string} Normalized height.
 */
const normalizeHeight = (height: string): string => height?.trim() || String(DEFAULTS.iframeHeight);

/**
 * Resolve the base URL for the embed iframe.
 *
 * @returns {string} The embed base URL.
 */
const resolveEmbedBaseUrl = (): string => {
  if (DEFAULTS.embedUrl) {
    if (/^https?:\/\//i.test(DEFAULTS.embedUrl)) return DEFAULTS.embedUrl;
    const origin = DEFAULTS.embedOrigin || 'https://quran.com';
    return `${origin.replace(/\/$/, '')}/${DEFAULTS.embedUrl.replace(/^\//, '')}`;
  }
  if (DEFAULTS.embedOrigin) {
    return `${DEFAULTS.embedOrigin.replace(/\/$/, '')}/embed/v1`;
  }
  return 'https://quran.com/embed/v1';
};

/**
 * Map theme variant to embed URL parameter value.
 *
 * @param {ThemeTypeVariant} theme - Theme variant.
 * @returns {string} Theme string for URL.
 */
const mapEmbedTheme = (theme: ThemeTypeVariant): string =>
  theme === ThemeType.Dark ? 'dark' : 'light';

/**
 * Build the verses parameter for the embed URL.
 *
 * @param {Preferences} preferences - Current preferences.
 * @returns {string} Formatted verses param (e.g., "33:56" or "33:56-60").
 */
const buildVersesParam = (preferences: Preferences): string => {
  const chapter = preferences.selectedSurah;
  const start = preferences.selectedAyah;
  if (preferences.rangeEnabled && preferences.rangeEnd > start) {
    return `${chapter}:${start}-${preferences.rangeEnd}`;
  }
  return `${chapter}:${start}`;
};

/**
 * Build the iframe src URL for /embed/v1.
 *
 * @param {Preferences} preferences - Current builder preferences.
 * @param {string} translationIdsCsv - Translation IDs as a CSV string.
 * @param {BuildEmbedOptions} options - Build options.
 * @returns {string} Complete iframe src URL.
 */
export const buildEmbedIframeSrc = (
  preferences: Preferences,
  translationIdsCsv: string,
  options: BuildEmbedOptions = {},
): string => {
  const url = new URL(resolveEmbedBaseUrl());

  const setParam = (key: string, value: string | undefined, defaultValue?: string) => {
    if (value === undefined) return;
    if (options.omitDefaults && defaultValue !== undefined && value === defaultValue) return;
    if (String(value).length === 0) return;
    url.searchParams.set(key, value);
  };

  setParam('verses', buildVersesParam(preferences));
  setParam('translations', translationIdsCsv, '');

  const reciterValue = preferences.reciter
    ? String(preferences.reciter)
    : String(DEFAULTS.reciterId);
  setParam('audio', String(preferences.enableAudio), 'true');
  setParam('reciter', reciterValue, String(DEFAULTS.reciterId));
  setParam('theme', mapEmbedTheme(preferences.theme), 'light');
  setParam('mushaf', preferences.mushaf, 'qpc');
  setParam('locale', preferences.locale, 'en');
  setParam('wbw', String(preferences.enableWbwTranslation), 'false');
  setParam('showTranslationName', String(preferences.showTranslatorName), 'false');
  setParam('showArabic', String(preferences.showArabic), 'true');
  setParam('tafsir', String(preferences.showTafsirs), 'true');
  setParam('reflections', String(preferences.showReflections), 'true');
  setParam('answers', String(preferences.showAnswers), 'true');
  setParam('mergeVerses', String(preferences.mergeVerses), 'false');

  return url.toString();
};

/**
 * Build complete iframe configuration including sizing and URL.
 *
 * @param {Preferences} preferences - Current builder preferences.
 * @param {string} translationIdsCsv - Translation IDs as a CSV string.
 * @param {BuildEmbedOptions} options - Build options.
 * @returns {WidgetIframeConfig} Iframe configuration object.
 */
export const buildEmbedIframeConfig = (
  preferences: Preferences,
  translationIdsCsv: string,
  options: BuildEmbedOptions = {},
): WidgetIframeConfig => {
  const widthValue = normalizeWidth(preferences.customSize.width);
  const heightValue = normalizeHeight(preferences.customSize.height);
  const src = buildEmbedIframeSrc(preferences, translationIdsCsv, options);

  return { src, widthValue, heightValue };
};

/**
 * Build the external HTML snippet to embed the widget.
 *
 * @param {Preferences} preferences - Current builder preferences.
 * @param {string} translationIdsCsv - Translation IDs as a CSV string.
 * @returns {string} Complete HTML iframe snippet.
 */
export const buildEmbedSnippet = (preferences: Preferences, translationIdsCsv: string): string => {
  const { src, widthValue, heightValue } = buildEmbedIframeConfig(preferences, translationIdsCsv);

  return `<iframe
  src="${src}"
  width="${widthValue}"
  height="${heightValue}"
  frameborder="0">
</iframe>`;
};
