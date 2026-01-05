/* eslint-disable max-lines */
/**
 * Widget Configuration - Main Entry Point
 *
 * This file re-exports all widget config modules for backwards compatibility.
 * New code should import directly from the specific modules.
 */

import { INITIAL_PREFERENCES } from './widget-defaults';
import type {
  AyahWidgetOverrides,
  Preferences,
  RangeMeta,
  SimpleOverrideKey,
} from './widget-types';

import { areArraysEqual } from '@/utils/array';
import type AvailableTranslation from 'types/AvailableTranslation';

// Re-export types
export type {
  AyahWidgetOverrides,
  BasePreferenceContext,
  Preferences,
  RangeMeta,
  SetState,
  SimpleOverrideKey,
  WidgetIframeConfig,
  WidgetSelectOption,
  WidgetSelectOptions,
} from './widget-types';

// Re-export defaults
export {
  DEFAULTS,
  getBasePreferences,
  getMushafFromQuranFont,
  INITIAL_PREFERENCES,
} from './widget-defaults';

// Re-export embed functions
export { buildEmbedIframeConfig, buildEmbedIframeSrc, buildEmbedSnippet } from './widget-embed';

// Re-export form config
export type { WidgetFieldConfig, WidgetFormBlock, WidgetFormContext } from './widget-form';
export { getWidgetLocaleOptions, WIDGET_FIELDS, WIDGET_FORM_BLOCKS } from './widget-form';

const PREFERENCE_KEYS = Object.keys(INITIAL_PREFERENCES) as Array<keyof Preferences>;
const SPECIAL_PREFERENCE_KEYS: Array<keyof Preferences> = ['translations', 'customSize'];

const isSimpleOverrideKey = (key: keyof Preferences): key is SimpleOverrideKey =>
  !SPECIAL_PREFERENCE_KEYS.includes(key);

const SIMPLE_OVERRIDE_KEYS: SimpleOverrideKey[] = PREFERENCE_KEYS.filter(isSimpleOverrideKey);

/**
 * Check whether the overrides object contains an explicit value for a key.
 *
 * @param {AyahWidgetOverrides} overrides - Overrides object.
 * @param {keyof AyahWidgetOverrides} key - Key to test.
 * @returns {boolean} Whether the override key is present.
 */
const hasOverride = <Key extends keyof AyahWidgetOverrides>(
  overrides: AyahWidgetOverrides,
  key: Key,
): boolean => Object.prototype.hasOwnProperty.call(overrides, key);

/**
 * Extract translation IDs from selected translation objects.
 *
 * @param {AvailableTranslation[]} translations - Selected translations.
 * @returns {number[]} Array of translation IDs.
 */
export const getTranslationIds = (translations: AvailableTranslation[]): number[] =>
  translations.map((t) => t.id).filter((id): id is number => typeof id === 'number');

/**
 * Build a comma-separated list of translation IDs.
 *
 * @param {AvailableTranslation[]} translations - Selected translations.
 * @returns {string} Comma-separated translation IDs.
 */
export const toTranslationIdsCsv = (translations: AvailableTranslation[]): string =>
  getTranslationIds(translations).join(',');

/**
 * Apply widget overrides to base preferences.
 *
 * @param {Preferences} base - Base preferences.
 * @param {AyahWidgetOverrides} overrides - Overrides to apply.
 * @returns {Preferences} Merged preferences.
 */
export const applyWidgetOverrides = (
  base: Preferences,
  overrides: AyahWidgetOverrides,
): Preferences => {
  const next: Preferences = { ...base };

  SIMPLE_OVERRIDE_KEYS.forEach((key) => {
    if (hasOverride(overrides, key)) {
      (next as unknown as Record<string, unknown>)[key as string] = (
        overrides as unknown as Record<string, unknown>
      )[key as string];
    }
  });

  if (hasOverride(overrides, 'customSize')) {
    next.customSize = {
      width: overrides.customSize?.width ?? base.customSize.width,
      height: overrides.customSize?.height ?? base.customSize.height,
    };
  }

  return next;
};

/**
 * Build overrides by diffing previous and next preferences.
 *
 * @param {Preferences} prev - Previous preferences.
 * @param {Preferences} next - Next preferences.
 * @returns {AyahWidgetOverrides} Patch object representing the differences.
 */
export const buildOverridesFromDiff = (
  prev: Preferences,
  next: Preferences,
): AyahWidgetOverrides => {
  const overrides: AyahWidgetOverrides = {};

  SIMPLE_OVERRIDE_KEYS.forEach((key) => {
    if (!Object.is((prev as any)[key], (next as any)[key])) {
      (overrides as any)[key] = (next as any)[key];
    }
  });

  const prevTranslationIds: number[] = getTranslationIds(prev.translations);
  const nextTranslationIds: number[] = getTranslationIds(next.translations);
  if (!areArraysEqual(prevTranslationIds, nextTranslationIds)) {
    overrides.translationIds = nextTranslationIds;
  }

  const widthChanged: boolean = prev.customSize.width !== next.customSize.width;
  const heightChanged: boolean = prev.customSize.height !== next.customSize.height;
  if (widthChanged || heightChanged) {
    overrides.customSize = { ...next.customSize };
  }

  return overrides;
};

/**
 * Generate verse options for a given versesCount.
 *
 * @param {number} versesCount - Total number of verses in the selected surah.
 * @returns {number[]} Array of verse numbers [1, 2, ..., versesCount].
 */
export const makeVerseOptions = (versesCount?: number): number[] => {
  if (!versesCount || versesCount < 1) return [];
  return Array.from({ length: versesCount }, (unused: unknown, i: number) => i + 1);
};

/**
 * Clamp ayah number into the valid range [1..versesCount].
 *
 * @param {number} ayah - Selected ayah number.
 * @param {number} versesCount - Total number of verses in the selected surah.
 * @returns {number} Clamped ayah number.
 */
export const clampAyahNumber = (ayah: number, versesCount: number): number => {
  if (ayah < 1) return 1;
  if (ayah > versesCount) return versesCount;
  return ayah;
};

/**
 * Group translations by language and apply a text filter.
 *
 * @param {AvailableTranslation[]} allTranslations - All available translations.
 * @param {string} searchQuery - Search query to filter translations.
 * @param {string} otherLanguageLabel - Label used when a translation has no languageName.
 * @returns {Array<[string, AvailableTranslation[]]>} Grouped translations sorted by language.
 */
export const groupTranslationsByLanguage = (
  allTranslations: AvailableTranslation[],
  searchQuery: string,
  otherLanguageLabel: string,
): Array<[string, AvailableTranslation[]]> => {
  if (!allTranslations.length) return [];

  const q: string = searchQuery.trim().toLowerCase();

  const filtered: AvailableTranslation[] = allTranslations.filter((tr) => {
    if (!q) return true;
    return (
      tr.name?.toLowerCase().includes(q) ||
      tr.authorName?.toLowerCase().includes(q) ||
      tr.languageName?.toLowerCase().includes(q)
    );
  });

  const grouped: Record<string, AvailableTranslation[]> = {};
  filtered.forEach((tr) => {
    const key: string = tr.languageName || otherLanguageLabel;
    grouped[key] ||= [];
    grouped[key].push(tr);
  });

  return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
};

/**
 * Compute range end options for range mode.
 * Caps the range to +10 verses from the selected start.
 *
 * @param {number} selectedAyah - Range start verse number.
 * @param {number[]} verseOptions - Available verse options for the selected surah.
 * @returns {RangeMeta} Range metadata for the UI.
 */
export const getRangeMeta = (selectedAyah: number, verseOptions: number[]): RangeMeta => {
  const rangeStart: number = selectedAyah;
  const verseMax: number = verseOptions.length ? verseOptions[verseOptions.length - 1] : rangeStart;
  const rangeEndCap: number = Math.min(rangeStart + 10, verseMax);

  const rangeOptions: number[] =
    rangeEndCap <= rangeStart
      ? []
      : Array.from(
          { length: rangeEndCap - rangeStart },
          (unused: unknown, idx: number) => rangeStart + idx + 1,
        );

  return {
    rangeOptions,
    rangeSelectable: rangeOptions.length > 0,
    rangeStart,
    rangeEndCap,
  };
};

/**
 * Normalize range-related preferences.
 * Disables range if not selectable, clamps rangeEnd into allowed range.
 *
 * @param {Preferences} prev - Previous preferences.
 * @param {RangeMeta} rangeMeta - Computed range metadata.
 * @returns {Preferences} Normalized preferences.
 */
export const normalizeRangePreferences = (prev: Preferences, rangeMeta: RangeMeta): Preferences => {
  let next: Preferences = prev;

  if (!rangeMeta.rangeSelectable && prev.rangeEnabled) {
    next = { ...next, rangeEnabled: false };
  }

  if (prev.rangeEnabled && rangeMeta.rangeSelectable) {
    const lowerBound: number = rangeMeta.rangeOptions[0];
    const upperBound: number = rangeMeta.rangeOptions[rangeMeta.rangeOptions.length - 1];

    const validEnd: number =
      prev.rangeEnd && prev.rangeEnd > prev.selectedAyah
        ? Math.min(Math.max(prev.rangeEnd, lowerBound), upperBound)
        : lowerBound;

    if (validEnd !== prev.rangeEnd) {
      next = { ...next, rangeEnd: validEnd };
    }
  }

  return next;
};
