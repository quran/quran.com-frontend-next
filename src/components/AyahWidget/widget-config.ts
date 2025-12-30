/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable max-lines */
import i18nConfig from '../../../i18n.json';

import ThemeType from '@/redux/types/ThemeType';
import type ThemeTypeVariant from '@/redux/types/ThemeTypeVariant';
import type { MushafType } from '@/types/ayah-widget';
import type Chapter from '@/types/Chapter';
import { QuranFont } from '@/types/QuranReader';
import { areArraysEqual } from '@/utils/array';
import { getLocaleName } from '@/utils/locale';
import type AvailableTranslation from 'types/AvailableTranslation';
import type Reciter from 'types/Reciter';

/**
 * User preferences for the Ayah Widget Builder.
 */
export type Preferences = {
  containerId: string;
  selectedSurah: number;
  selectedAyah: number;
  translations: AvailableTranslation[];
  theme: ThemeTypeVariant;
  mushaf: MushafType;
  enableAudio: boolean;
  enableWbwTranslation: boolean;
  showTranslatorName: boolean;
  showTafsirs: boolean;
  showReflections: boolean;
  showAnswers: boolean;
  locale: string;
  reciter: number | null;
  showArabic: boolean;
  rangeEnabled: boolean;
  rangeEnd: number;
  customSize: {
    width: string;
    height: string;
  };
};

export type AyahWidgetOverrides = Partial<Omit<Preferences, 'translations' | 'customSize'>> & {
  translationIds?: number[];
  customSize?: {
    width?: string;
    height?: string;
  };
};

type SetStateAction<T> = T | ((prev: T) => T);

/**
 * A tiny, framework-agnostic setter type (similar to React's setState).
 */
export type SetState<T> = (value: SetStateAction<T>) => void;

/**
 * Default values for the Ayah Widget Builder.
 */
export const DEFAULTS = {
  containerId: 'quran-embed-1',
  surah: 33, // Surah Al-Ahzab
  ayah: 56, // Ayah 56
  reciterId: 7, // Mishary Rashid Alafasy (ID 7)
  translationId: 131, // Mustafa Khattab
  copySuccessDurationMs: 2000,
  snippetScriptUrl:
    process.env.NEXT_PUBLIC_AYAH_WIDGET_SCRIPT_URL || 'https://quran.com/embed/quran-embed.js',
  snippetWidgetOrigin: process.env.NEXT_PUBLIC_AYAH_WIDGET_ORIGIN || '',
} as const;

/**
 * Initial settings shown in the builder UI (static defaults only).
 */
export const INITIAL_PREFERENCES: Preferences = {
  containerId: DEFAULTS.containerId,
  selectedSurah: DEFAULTS.surah,
  selectedAyah: DEFAULTS.ayah,
  translations: [],
  theme: ThemeType.Light,
  mushaf: 'qpc',
  enableAudio: true,
  enableWbwTranslation: false,
  showTranslatorName: false,
  showTafsirs: true,
  showReflections: true,
  showAnswers: true,
  locale: 'en',
  reciter: DEFAULTS.reciterId,
  showArabic: true,
  rangeEnabled: false,
  rangeEnd: DEFAULTS.ayah + 1,
  customSize: {
    width: '100%',
    height: '',
  },
};

/**
 * Map the selected Quran font (reader setting) to the widget mushaf option.
 *
 * @param {QuranFont} quranFont - The selected Quran font.
 * @returns {MushafType} The corresponding mushaf type for the widget.
 */
export const getMushafFromQuranFont = (quranFont: QuranFont): MushafType => {
  switch (quranFont) {
    case QuranFont.MadaniV1:
      return 'kfgqpc_v1';
    case QuranFont.MadaniV2:
      return 'kfgqpc_v2';
    case QuranFont.IndoPak:
      return 'indopak';
    case QuranFont.TajweedV4:
    case QuranFont.Tajweed:
      return 'tajweed';
    default:
      return 'qpc';
  }
};

export type BasePreferenceContext = {
  theme: ThemeTypeVariant;
  locale: string;
  mushaf: MushafType;
  enableWbwTranslation: boolean;
};

/**
 * Build base preferences from QDC defaults (theme/locale/mushaf/wbw).
 *
 * @param {BasePreferenceContext} context - The QDC-derived defaults.
 * @returns {Preferences} Base widget preferences.
 */
export const getBasePreferences = (context: BasePreferenceContext): Preferences => ({
  ...INITIAL_PREFERENCES,
  theme: context.theme,
  locale: context.locale,
  mushaf: context.mushaf,
  enableWbwTranslation: context.enableWbwTranslation,
});

const PREFERENCE_KEYS = Object.keys(INITIAL_PREFERENCES) as Array<keyof Preferences>;
const SPECIAL_PREFERENCE_KEYS: Array<keyof Preferences> = ['translations', 'customSize'];
type SimpleOverrideKey = Exclude<keyof Preferences, 'translations' | 'customSize'>;

const isSimpleOverrideKey = (key: keyof Preferences): key is SimpleOverrideKey =>
  !SPECIAL_PREFERENCE_KEYS.includes(key);

const SIMPLE_OVERRIDE_KEYS: SimpleOverrideKey[] = PREFERENCE_KEYS.filter(isSimpleOverrideKey);

/**
 * Check whether the overrides object contains an explicit value for a key.
 * We use `hasOwnProperty` to distinguish "missing" from "present but undefined/null".
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
 * @returns {number[]} Translation IDs.
 */
export const getTranslationIds = (translations: AvailableTranslation[]): number[] =>
  translations.map((t) => t.id).filter((id): id is number => typeof id === 'number');

/**
 * Build a comma-separated list of translation IDs from selected translations.
 *
 * @param {AvailableTranslation[]} translations - Selected translations.
 * @returns {string} Comma-separated translation IDs.
 */
export const toTranslationIdsCsv = (translations: AvailableTranslation[]): string =>
  getTranslationIds(translations).join(',');

/**
 * Apply widget overrides to base preferences.
 *
 * Notes:
 * - Simple keys are applied generically.
 * - `customSize` is handled explicitly because it's nested.
 * - Translations are not stored as objects in overrides; we store IDs separately (`translationIds`).
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

  // Apply scalar/simple properties.
  SIMPLE_OVERRIDE_KEYS.forEach((key) => {
    if (hasOverride(overrides, key)) {
      (next as unknown as Record<string, unknown>)[key as string] = (
        overrides as unknown as Record<string, unknown>
      )[key as string];
    }
  });

  // Apply customSize (nested).
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
 * Only includes properties that changed.
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

  // Compare simple properties.
  SIMPLE_OVERRIDE_KEYS.forEach((key) => {
    if (!Object.is((prev as any)[key], (next as any)[key])) {
      (overrides as any)[key] = (next as any)[key];
    }
  });

  // Translations => store IDs only.
  const prevTranslationIds: number[] = getTranslationIds(prev.translations);
  const nextTranslationIds: number[] = getTranslationIds(next.translations);
  if (!areArraysEqual(prevTranslationIds, nextTranslationIds)) {
    overrides.translationIds = nextTranslationIds;
  }

  // customSize (nested).
  const widthChanged: boolean = prev.customSize.width !== next.customSize.width;
  const heightChanged: boolean = prev.customSize.height !== next.customSize.height;
  if (widthChanged || heightChanged) {
    overrides.customSize = { ...next.customSize };
  }

  return overrides;
};

/**
 * Generate verse options for a given versesCount.
 * Example: versesCount=3 -> [1, 2, 3]
 *
 * @param {number | undefined} versesCount - Total number of verses in the selected surah.
 * @returns {number[]} Array of verse numbers.
 */
export const makeVerseOptions = (versesCount?: number): number[] => {
  if (!versesCount || versesCount < 1) return [];
  return Array.from({ length: versesCount }, (_unused: unknown, i: number) => i + 1);
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
 * @returns {Array<[string, AvailableTranslation[]]>} Array tuples: [languageName, translations[]], sorted by languageName.
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

export type RangeMeta = {
  rangeOptions: number[];
  rangeSelectable: boolean;
  rangeStart: number;
  rangeEndCap: number;
};

/**
 * Compute range end options for range mode.
 * We cap the range to +10 verses from the selected start to keep the UI manageable.
 *
 * @param {number} selectedAyah - Range start.
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
          (_unused: unknown, idx: number) => rangeStart + idx + 1,
        );

  return {
    rangeOptions,
    rangeSelectable: rangeOptions.length > 0,
    rangeStart,
    rangeEndCap,
  };
};

/**
 * Normalize range-related preferences:
 * - Disable range if it's not selectable.
 * - Clamp `rangeEnd` into the current allowed range options.
 *
 * @param {Preferences} prev - Previous preferences.
 * @param {RangeMeta} rangeMeta - Computed range metadata.
 * @returns {Preferences} Next normalized preferences.
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

export type WidgetSelectOption = {
  value: string | number;
  label?: string;
  labelKey?: string;
  disabled?: boolean;
};

export type WidgetSelectOptions = {
  items: WidgetSelectOption[];
  valueOverride?: string | number;
};

export type WidgetFieldConfig = {
  id: string;
  type: 'text' | 'select' | 'checkbox';
  labelKey: string;
  controlId: string;
  inputVariant?: 'default' | 'size';
  preferenceKey?: SimpleOverrideKey;
  options?: (context: WidgetFormContext) => WidgetSelectOptions;
  parseValue?: (raw: string, context: WidgetFormContext) => string | number | boolean | null;
  getValue?: (preferences: Preferences, context: WidgetFormContext) => string | number | boolean;
  setValue?: (
    value: string | number | boolean | null,
    prev: Preferences,
    context: WidgetFormContext,
  ) => Preferences;
  isDisabled?: (preferences: Preferences, context: WidgetFormContext) => boolean;
  isVisible?: (preferences: Preferences, context: WidgetFormContext) => boolean;
  dimWhenDisabled?: boolean;
};

export type WidgetFormBlock =
  | { kind: 'field'; field: WidgetFieldConfig }
  | { kind: 'twoColumn'; fields: [WidgetFieldConfig, WidgetFieldConfig] }
  | {
      kind: 'surahAyahRange';
      surahField: WidgetFieldConfig;
      ayahField: WidgetFieldConfig;
      rangeField: WidgetFieldConfig;
      rangeToggleField: WidgetFieldConfig;
    }
  | { kind: 'translations' };

export type WidgetFormContext = {
  t: (key: string, params?: Record<string, unknown>) => string;
  preferences: Preferences;
  setUserPreferences: SetState<Preferences>;
  surahs: Chapter[];
  verseOptions: number[];
  rangeMeta: RangeMeta;
  groupedTranslations: [string, AvailableTranslation[]][];
  translationSearch: string;
  setTranslationSearch: (value: string) => void;
  selectedTranslationIds: Set<number | undefined>;
  toggleTranslation: (translation: AvailableTranslation) => void;
  reciters: Reciter[];
  localeOptions: { code: string; name: string }[];
};

/**
 * Locale options for the widget language selector.
 *
 * @returns {{ code: string; name: string }[]} Available locales (sorted by name).
 */
export const getWidgetLocaleOptions = (): { code: string; name: string }[] =>
  i18nConfig.locales
    .map((code: string) => ({ code, name: getLocaleName(code) || code }))
    .sort((a, b) => a.name.localeCompare(b.name));

export const WIDGET_FIELDS: Record<string, WidgetFieldConfig> = {
  containerId: {
    id: 'containerId',
    type: 'text',
    labelKey: 'fields.containerId',
    controlId: 'container-id',
    inputVariant: 'default',
    preferenceKey: 'containerId',
    setValue: (value: string | number | boolean | null, prev: Preferences) => ({
      ...prev,
      containerId: String(value || prev.containerId),
    }),
  },

  selectedSurah: {
    id: 'selectedSurah',
    type: 'select',
    labelKey: 'fields.surah',
    controlId: 'surah-select',
    preferenceKey: 'selectedSurah',
    options: ({ surahs }: WidgetFormContext) =>
      surahs.length
        ? {
            items: surahs.map((surah: Chapter) => ({
              value: Number(surah.id),
              label: `${Number(surah.id)}. ${surah.transliteratedName}`,
            })),
          }
        : {
            items: [{ value: '', labelKey: 'states.loadingChapters', disabled: true }],
            valueOverride: '',
          },
    parseValue: (raw: string) => Number(raw),
    setValue: (value: string | number | boolean | null, prev: Preferences) => ({
      ...prev,
      selectedSurah: Number(value),
      selectedAyah: 1,
    }),
  },

  selectedAyah: {
    id: 'selectedAyah',
    type: 'select',
    labelKey: 'fields.ayah',
    controlId: 'ayah-select',
    preferenceKey: 'selectedAyah',
    options: ({ verseOptions }: WidgetFormContext) =>
      verseOptions.length
        ? { items: verseOptions.map((ayah: number) => ({ value: ayah, label: String(ayah) })) }
        : {
            items: [{ value: '', labelKey: 'states.loadingVerses', disabled: true }],
            valueOverride: '',
          },
    parseValue: (raw: string) => Number(raw),
  },

  rangeEnd: {
    id: 'rangeEnd',
    type: 'select',
    labelKey: 'fields.ayah',
    controlId: 'range-end-select',
    preferenceKey: 'rangeEnd',
    options: ({ rangeMeta }: WidgetFormContext) => ({
      items: rangeMeta.rangeOptions.map((ayah: number) => ({ value: ayah, label: String(ayah) })),
    }),
    parseValue: (raw: string) => Number(raw),
    isVisible: (preferences: Preferences, { rangeMeta }: WidgetFormContext) =>
      preferences.rangeEnabled && rangeMeta.rangeSelectable,
  },

  rangeEnabled: {
    id: 'rangeEnabled',
    type: 'checkbox',
    labelKey: 'checkboxes.verseRange',
    controlId: 'range-toggle',
    preferenceKey: 'rangeEnabled',
    isDisabled: (_preferences: Preferences, { rangeMeta }: WidgetFormContext) =>
      !rangeMeta.rangeSelectable,
    setValue: (
      value: string | number | boolean | null,
      prev: Preferences,
      { rangeMeta }: WidgetFormContext,
    ) =>
      normalizeRangePreferences(
        {
          ...prev,
          rangeEnabled: Boolean(value),
        },
        rangeMeta,
      ),
  },

  theme: {
    id: 'theme',
    type: 'select',
    labelKey: 'fields.theme',
    controlId: 'theme-select',
    preferenceKey: 'theme',
    options: () => ({
      items: [
        { value: 'light', labelKey: 'theme.light' },
        { value: 'dark', labelKey: 'theme.dark' },
        { value: 'sepia', labelKey: 'theme.sepia' },
      ],
    }),
  },

  locale: {
    id: 'locale',
    type: 'select',
    labelKey: 'fields.language',
    controlId: 'locale-select',
    preferenceKey: 'locale',
    options: ({ localeOptions }: WidgetFormContext) => ({
      items: localeOptions.map((option: { code: string; name: string }) => ({
        value: option.code,
        label: option.name,
      })),
    }),
  },

  showArabic: {
    id: 'showArabic',
    type: 'checkbox',
    labelKey: 'checkboxes.showArabic',
    controlId: 'show-arabic-toggle',
    preferenceKey: 'showArabic',
  },

  mushaf: {
    id: 'mushaf',
    type: 'select',
    labelKey: 'fields.mushaf',
    controlId: 'mushaf-select',
    preferenceKey: 'mushaf',
    options: () => ({
      items: [
        { value: 'qpc', labelKey: 'mushaf.qpc' },
        { value: 'kfgqpc_v1', labelKey: 'mushaf.kfgqpc_v1' },
        { value: 'kfgqpc_v2', labelKey: 'mushaf.kfgqpc_v2' },
        { value: 'indopak', labelKey: 'mushaf.indopak' },
        { value: 'tajweed', labelKey: 'mushaf.tajweed' },
      ],
    }),
    isDisabled: (preferences: Preferences) => !preferences.showArabic,
    dimWhenDisabled: true,
  },

  reciter: {
    id: 'reciter',
    type: 'select',
    labelKey: 'fields.reciter',
    controlId: 'reciter-select',
    preferenceKey: 'reciter',
    isDisabled: (_preferences: Preferences, { reciters }: WidgetFormContext) => !reciters.length,
    options: ({ reciters }: WidgetFormContext) =>
      reciters.length
        ? {
            items: [
              { value: '', labelKey: 'reciters.select' },
              ...reciters.map((reciter: Reciter) => ({
                value: reciter.id,
                label: `${reciter.name}${reciter.style?.name ? ` (${reciter.style.name})` : ''}`,
              })),
            ],
          }
        : {
            items: [{ value: '', labelKey: 'states.loadingReciters', disabled: true }],
            valueOverride: '',
          },
    parseValue: (raw: string) => (raw ? Number(raw) : null),
  },

  enableAudio: {
    id: 'enableAudio',
    type: 'checkbox',
    labelKey: 'checkboxes.audio',
    controlId: 'audio-toggle',
    preferenceKey: 'enableAudio',
  },

  enableWbwTranslation: {
    id: 'enableWbwTranslation',
    type: 'checkbox',
    labelKey: 'checkboxes.wordByWord',
    controlId: 'wbw-toggle',
    preferenceKey: 'enableWbwTranslation',
    isDisabled: (preferences: Preferences) => !preferences.showArabic,
  },

  showTranslatorName: {
    id: 'showTranslatorName',
    type: 'checkbox',
    labelKey: 'checkboxes.translator',
    controlId: 'translator-toggle',
    preferenceKey: 'showTranslatorName',
  },

  showTafsirs: {
    id: 'showTafsirs',
    type: 'checkbox',
    labelKey: 'checkboxes.tafsirs',
    controlId: 'tafsirs-toggle',
    preferenceKey: 'showTafsirs',
  },

  showReflections: {
    id: 'showReflections',
    type: 'checkbox',
    labelKey: 'checkboxes.reflections',
    controlId: 'reflections-toggle',
    preferenceKey: 'showReflections',
  },

  showAnswers: {
    id: 'showAnswers',
    type: 'checkbox',
    labelKey: 'checkboxes.answers',
    controlId: 'answers-toggle',
    preferenceKey: 'showAnswers',
  },

  customWidth: {
    id: 'customWidth',
    type: 'text',
    labelKey: 'fields.width',
    controlId: 'custom-width',
    inputVariant: 'size',
    getValue: (preferences: Preferences) => preferences.customSize.width,
    setValue: (value: string | number | boolean | null, prev: Preferences) => ({
      ...prev,
      customSize: { ...prev.customSize, width: String(value) },
    }),
  },

  customHeight: {
    id: 'customHeight',
    type: 'text',
    labelKey: 'fields.height',
    controlId: 'custom-height',
    inputVariant: 'size',
    getValue: (preferences: Preferences) => preferences.customSize.height,
    setValue: (value: string | number | boolean | null, prev: Preferences) => ({
      ...prev,
      customSize: { ...prev.customSize, height: String(value) },
    }),
  },
};

/**
 * Form layout for the builder: add new options here to render them automatically.
 */
export const WIDGET_FORM_BLOCKS: WidgetFormBlock[] = [
  { kind: 'field', field: WIDGET_FIELDS.containerId },
  {
    kind: 'surahAyahRange',
    surahField: WIDGET_FIELDS.selectedSurah,
    ayahField: WIDGET_FIELDS.selectedAyah,
    rangeField: WIDGET_FIELDS.rangeEnd,
    rangeToggleField: WIDGET_FIELDS.rangeEnabled,
  },
  { kind: 'field', field: WIDGET_FIELDS.theme },
  { kind: 'field', field: WIDGET_FIELDS.locale },
  { kind: 'field', field: WIDGET_FIELDS.showArabic },
  { kind: 'field', field: WIDGET_FIELDS.mushaf },
  { kind: 'translations' },
  { kind: 'field', field: WIDGET_FIELDS.reciter },
  { kind: 'field', field: WIDGET_FIELDS.enableAudio },
  { kind: 'field', field: WIDGET_FIELDS.enableWbwTranslation },
  { kind: 'field', field: WIDGET_FIELDS.showTranslatorName },
  { kind: 'field', field: WIDGET_FIELDS.showTafsirs },
  { kind: 'field', field: WIDGET_FIELDS.showReflections },
  { kind: 'field', field: WIDGET_FIELDS.showAnswers },
  { kind: 'twoColumn', fields: [WIDGET_FIELDS.customWidth, WIDGET_FIELDS.customHeight] },
];

type AttributeEntry = [string, string];

const normalizeWidth = (width: string): string => width?.trim() || '100%';
const normalizeHeight = (height: string): string => height?.trim() || '';

type BuildAttributeOptions = {
  omitDefaults?: boolean;
  origin?: string;
};

export type WidgetAttributeResult = {
  attributes: AttributeEntry[];
  widthValue: string;
  heightValue: string;
};

/**
 * Build data-* attributes for the widget script (preview + embed snippet).
 *
 * @param {Preferences} preferences - Current builder preferences.
 * @param {string} translationIdsCsv - Translation IDs as a CSV string.
 * @param {BuildAttributeOptions} options - Extra options (omitDefaults, origin override).
 * @returns {WidgetAttributeResult} The data-* attributes + resolved width/height.
 */
export const buildWidgetScriptAttributes = (
  preferences: Preferences,
  translationIdsCsv: string,
  options: BuildAttributeOptions = {},
): WidgetAttributeResult => {
  const widthValue: string = normalizeWidth(preferences.customSize.width);
  const heightValue: string = normalizeHeight(preferences.customSize.height);

  const entries: AttributeEntry[] = [];

  /**
   * Push a data-* attribute entry.
   * - Skips undefined values.
   * - When omitDefaults=true, skips values equal to their defaults.
   *
   * @param {string} key - The attribute key.
   * @param {string | undefined} value - The attribute value.
   * @param {string | undefined} defaultValue - Default value to compare against when omitDefaults=true.
   * @returns {void}
   */
  const pushAttr = (key: string, value: string | undefined, defaultValue?: string): void => {
    if (value === undefined) return;
    if (options.omitDefaults && defaultValue !== undefined && value === defaultValue) return;
    entries.push([key, value]);
  };

  // Keep origin near the script src (makes reading generated snippet easier).
  if (options.origin) {
    entries.push(['data-quran-origin', options.origin]);
  }

  pushAttr('data-quran-target', preferences.containerId);
  pushAttr('data-quran-ayah', `${preferences.selectedSurah}:${preferences.selectedAyah}`);
  pushAttr('data-quran-translation-ids', translationIdsCsv, '');

  const reciterValue: string = preferences.reciter
    ? String(preferences.reciter)
    : String(DEFAULTS.reciterId);
  pushAttr('data-quran-reciter-id', reciterValue, String(DEFAULTS.reciterId));

  pushAttr('data-quran-audio', String(preferences.enableAudio), 'true');
  pushAttr('data-quran-word-by-word', String(preferences.enableWbwTranslation), 'false');
  pushAttr('data-quran-theme', preferences.theme, 'light');
  pushAttr('data-quran-mushaf', preferences.mushaf, 'qpc');
  pushAttr('data-quran-show-translator-names', String(preferences.showTranslatorName), 'false');
  pushAttr('data-quran-show-arabic', String(preferences.showArabic), 'true');
  pushAttr('data-quran-show-tafsirs', String(preferences.showTafsirs), 'true');
  pushAttr('data-quran-show-reflections', String(preferences.showReflections), 'true');
  pushAttr('data-quran-show-answers', String(preferences.showAnswers), 'true');
  pushAttr('data-quran-locale', preferences.locale, 'en');

  if (preferences.rangeEnabled) {
    pushAttr('data-quran-range-end', String(preferences.rangeEnd));
  }

  // Keep width/height data attributes for compatibility with existing embeds.
  pushAttr('data-width', widthValue, '100%');
  if (heightValue) {
    pushAttr('data-height', heightValue);
  }

  return { attributes: entries, widthValue, heightValue };
};

/**
 * Build the external embed snippet based on current preferences.
 *
 * @param {Preferences} preferences - Current builder preferences.
 * @param {string} translationIdsCsv - Translation IDs as a CSV string.
 * @returns {string} Complete HTML snippet to embed the widget.
 */
export const buildEmbedSnippet = (preferences: Preferences, translationIdsCsv: string): string => {
  const { attributes, widthValue, heightValue } = buildWidgetScriptAttributes(
    preferences,
    translationIdsCsv,
    {
      omitDefaults: true,
      origin: DEFAULTS.snippetWidgetOrigin || undefined,
    },
  );

  const containerStyles: string[] = [`width: ${widthValue}`];
  if (heightValue) containerStyles.push(`height: ${heightValue}`);

  const containerStyleAttr: string = containerStyles.length
    ? ` style="${containerStyles.join('; ')}"`
    : '';

  const attrs: string[] = [
    `src="${DEFAULTS.snippetScriptUrl}"`,
    ...attributes.map(([key, value]) => `${key}="${value}"`),
  ];

  return `<div id="${preferences.containerId}"${containerStyleAttr}></div>

<script
  ${attrs.join('\n  ')}
  async>
</script>`;
};
