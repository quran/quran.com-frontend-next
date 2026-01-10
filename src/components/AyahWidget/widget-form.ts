/* eslint-disable max-lines */
/**
 * Widget Form - Form field configurations for the Ayah Widget Builder UI.
 */

import i18nConfig from '../../../i18n.json';

import type {
  Preferences,
  RangeMeta,
  SetState,
  SimpleOverrideKey,
  WidgetSelectOptions,
} from './widget-types';

import type Chapter from '@/types/Chapter';
import { getLocaleName } from '@/utils/locale';
import type AvailableTranslation from 'types/AvailableTranslation';
import type Reciter from 'types/Reciter';

/**
 * Configuration for a single form field in the widget builder.
 */
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

/**
 * Layout block for the widget builder form.
 */
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

/**
 * Context object passed to form field callbacks.
 */
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
 * Get available locale options for the widget language selector.
 *
 * @returns {{ code: string; name: string }[]} Array of locale options sorted by name.
 */
export const getWidgetLocaleOptions = (): { code: string; name: string }[] =>
  i18nConfig.locales
    .map((code: string) => ({ code, name: getLocaleName(code) || code }))
    .sort((a, b) => a.name.localeCompare(b.name));

/**
 * Normalize range-related preferences when range state changes.
 *
 * @param {Preferences} prev - Previous preferences.
 * @param {RangeMeta} rangeMeta - Computed range metadata.
 * @returns {Preferences} Normalized preferences.
 */
const normalizeRangePreferences = (prev: Preferences, rangeMeta: RangeMeta): Preferences => {
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

/**
 * Field configurations for the widget builder form.
 */
export const WIDGET_FIELDS: Record<string, WidgetFieldConfig> = {
  clientId: {
    id: 'clientId',
    type: 'text',
    labelKey: 'fields.clientId',
    controlId: 'client-id',
    inputVariant: 'default',
    preferenceKey: 'clientId',
    setValue: (value, prev) => ({
      ...prev,
      clientId: String(value ?? ''),
    }),
  },

  selectedSurah: {
    id: 'selectedSurah',
    type: 'select',
    labelKey: 'fields.surah',
    controlId: 'surah-select',
    preferenceKey: 'selectedSurah',
    options: ({ surahs }) =>
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
    parseValue: (raw) => Number(raw),
    setValue: (value, prev) => ({
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
    options: ({ verseOptions }) =>
      verseOptions.length
        ? { items: verseOptions.map((ayah: number) => ({ value: ayah, label: String(ayah) })) }
        : {
            items: [{ value: '', labelKey: 'states.loadingVerses', disabled: true }],
            valueOverride: '',
          },
    parseValue: (raw) => Number(raw),
    // When ayah changes, ensure rangeEnd stays valid (must be > selectedAyah)
    setValue: (value, prev, { rangeMeta }) => {
      const nextAyah = Number(value);
      const next = { ...prev, selectedAyah: nextAyah };

      // If rangeEnd is now invalid (not greater than new selectedAyah), reset it
      if (prev.rangeEnabled && prev.rangeEnd <= nextAyah) {
        // Set to first valid option (selectedAyah + 1) if available
        const newRangeEnd = nextAyah + 1;
        const maxAyah = rangeMeta.rangeEndCap;
        if (newRangeEnd <= maxAyah) {
          return { ...next, rangeEnd: newRangeEnd };
        }
        // If no valid range possible, disable range mode
        return { ...next, rangeEnabled: false };
      }

      return next;
    },
  },

  rangeEnd: {
    id: 'rangeEnd',
    type: 'select',
    labelKey: 'fields.ayah',
    controlId: 'range-end-select',
    preferenceKey: 'rangeEnd',
    options: ({ rangeMeta }) => ({
      items: rangeMeta.rangeOptions.map((ayah: number) => ({ value: ayah, label: String(ayah) })),
    }),
    parseValue: (raw) => Number(raw),
    isVisible: (preferences, { rangeMeta }) =>
      preferences.rangeEnabled && rangeMeta.rangeSelectable,
  },

  rangeEnabled: {
    id: 'rangeEnabled',
    type: 'checkbox',
    labelKey: 'checkboxes.verseRange',
    controlId: 'range-toggle',
    preferenceKey: 'rangeEnabled',
    isDisabled: (preferences, { rangeMeta }) => !rangeMeta.rangeSelectable,
    setValue: (value, prev, { rangeMeta }) =>
      normalizeRangePreferences({ ...prev, rangeEnabled: Boolean(value) }, rangeMeta),
  },

  mergeVerses: {
    id: 'mergeVerses',
    type: 'checkbox',
    labelKey: 'checkboxes.mergeVerses',
    controlId: 'merge-verses-toggle',
    preferenceKey: 'mergeVerses',
    isVisible: (preferences) => preferences.rangeEnabled,
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
    options: ({ localeOptions }) => ({
      items: localeOptions.map((option) => ({
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
    isDisabled: (preferences) => !preferences.showArabic,
    dimWhenDisabled: true,
  },

  reciter: {
    id: 'reciter',
    type: 'select',
    labelKey: 'fields.reciter',
    controlId: 'reciter-select',
    preferenceKey: 'reciter',
    isDisabled: (preferences, { reciters }) => !reciters.length,
    options: ({ reciters }) =>
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
    parseValue: (raw) => (raw ? Number(raw) : null),
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
    isDisabled: (preferences) => !preferences.showArabic,
  },

  enableWbwTransliteration: {
    id: 'enableWbwTransliteration',
    type: 'checkbox',
    labelKey: 'checkboxes.wordByWordTransliteration',
    controlId: 'wbw-transliteration-toggle',
    preferenceKey: 'enableWbwTransliteration',
    isDisabled: (preferences) => !preferences.showArabic,
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
    getValue: (preferences) => preferences.customSize.width,
    setValue: (value, prev) => ({
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
    getValue: (preferences) => preferences.customSize.height,
    setValue: (value, prev) => ({
      ...prev,
      customSize: { ...prev.customSize, height: String(value) },
    }),
  },
};

/**
 * Form layout blocks for the widget builder.
 * Add new options here to render them automatically in the UI.
 */
export const WIDGET_FORM_BLOCKS: WidgetFormBlock[] = [
  { kind: 'field', field: WIDGET_FIELDS.clientId },
  {
    kind: 'surahAyahRange',
    surahField: WIDGET_FIELDS.selectedSurah,
    ayahField: WIDGET_FIELDS.selectedAyah,
    rangeField: WIDGET_FIELDS.rangeEnd,
    rangeToggleField: WIDGET_FIELDS.rangeEnabled,
  },
  { kind: 'field', field: WIDGET_FIELDS.mergeVerses },
  { kind: 'field', field: WIDGET_FIELDS.theme },
  { kind: 'field', field: WIDGET_FIELDS.locale },
  { kind: 'field', field: WIDGET_FIELDS.showArabic },
  { kind: 'field', field: WIDGET_FIELDS.mushaf },
  { kind: 'translations' },
  { kind: 'field', field: WIDGET_FIELDS.reciter },
  { kind: 'field', field: WIDGET_FIELDS.enableAudio },
  { kind: 'field', field: WIDGET_FIELDS.enableWbwTranslation },
  { kind: 'field', field: WIDGET_FIELDS.enableWbwTransliteration },
  { kind: 'field', field: WIDGET_FIELDS.showTranslatorName },
  { kind: 'field', field: WIDGET_FIELDS.showTafsirs },
  { kind: 'field', field: WIDGET_FIELDS.showReflections },
  { kind: 'field', field: WIDGET_FIELDS.showAnswers },
  { kind: 'twoColumn', fields: [WIDGET_FIELDS.customWidth, WIDGET_FIELDS.customHeight] },
];
