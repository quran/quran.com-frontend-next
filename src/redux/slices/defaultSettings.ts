/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { getLocaleInitialState } from '../defaultSettings/util';

import { getCountryLanguagePreference } from '@/api';
import resetSettings from '@/redux/actions/reset-settings';
import { RootState } from '@/redux/RootState';
import { setSelectedWordByWordLocale } from '@/redux/slices/QuranReader/readingPreferences';
import { setQuranFont, setMushafLines } from '@/redux/slices/QuranReader/styles';
import { setSelectedTafsirs } from '@/redux/slices/QuranReader/tafsirs';
import { setSelectedTranslations } from '@/redux/slices/QuranReader/translations';
import SliceName from '@/redux/types/SliceName';
import { QuranFont, MushafLines, Mushaf } from '@/types/QuranReader';
import { getMushafId } from '@/utils/api';
import { addOrUpdateBulkUserPreferences } from '@/utils/auth/api';
import { stateToPreferenceGroups } from '@/utils/auth/preferencesMapper';
import { detectUserLanguageAndCountry } from '@/utils/serverSideLanguageDetection';
import { CountryLanguagePreferenceResponse } from 'types/ApiResponses';
import ReflectionLanguage from 'types/QuranReflect/ReflectionLanguage';

// Import the necessary action creators for the thunk

/**
 * The DefaultSettings slice manages settings related to localization and user preferences.
 *
 * It includes two key flags:
 * - isUsingDefaultSettings: This is a state-driven flag that reflects whether the CURRENT settings
 *   (e.g., selected translations, font) EXACTLY match the default settings for the active locale.
 *   It is re-evaluated on every preference change.
 *
 * - userHasCustomised: This is a behavioral flag that tracks whether the user has EVER
 *   manually changed a preference. It is set to `true` on the first customization and only
 *   resets to `false` when the user explicitly resets their settings. This flag is crucial
 *   for deciding whether to apply new default settings when the site language changes,
 *   as per product requirements (see docs/qdc-localization-pbi.md, requirement #5).
 */
export type DefaultSettings = {
  isUsingDefaultSettings: boolean;
  detectedCountry: string;
  detectedLanguage: string;
  userHasCustomised: boolean;
  ayahReflectionsLanguages: ReflectionLanguage[];
  learningPlanLanguageIsoCodes: string[];
};

const normalizeLearningPlanLanguageIsoCodes = (languageIsoCodes?: string[]): string[] => {
  const normalized =
    languageIsoCodes
      ?.map((code) => code?.trim().toLowerCase())
      .filter((code, index, array) => code && array.indexOf(code) === index) || [];

  if (normalized.length === 0) {
    return ['en'];
  }

  return normalized;
};

const initialState: DefaultSettings = {
  isUsingDefaultSettings: true,
  detectedCountry: '',
  detectedLanguage: '',
  userHasCustomised: false,
  ayahReflectionsLanguages: [ReflectionLanguage.ENGLISH], // Default to English only
  learningPlanLanguageIsoCodes: normalizeLearningPlanLanguageIsoCodes(),
};

/**
 * Helper to map mushaf id to quranFont and mushafLines
 * @param {number} mushafId - The mushaf ID to map
 * @returns {{ quranFont: QuranFont; mushafLines?: MushafLines }} The font and lines configuration
 */
const mapMushafToFontAndLines = (mushafId: number) => {
  switch (mushafId) {
    case Mushaf.QCFV1:
      return { quranFont: QuranFont.MadaniV1 };
    case Mushaf.QCFV2:
      return { quranFont: QuranFont.MadaniV2 };
    case Mushaf.Tajweed:
      return { quranFont: QuranFont.Tajweed };
    case Mushaf.QCFTajweedV4:
      return { quranFont: QuranFont.TajweedV4 };
    case Mushaf.UthmaniHafs:
      return { quranFont: QuranFont.Uthmani };
    case Mushaf.Indopak15Lines:
      return { quranFont: QuranFont.IndoPak, mushafLines: MushafLines.FifteenLines };
    case Mushaf.Indopak16Lines:
      return { quranFont: QuranFont.IndoPak, mushafLines: MushafLines.SixteenLines };
    case Mushaf.Indopak:
      return { quranFont: QuranFont.IndoPak };
    case Mushaf.KFGQPCHAFS:
      return { quranFont: QuranFont.QPCHafs };
    default:
      return { quranFont: QuranFont.QPCHafs };
  }
};

/**
 * Apply mushaf settings from country preference
 */
const applyMushafSettings = (
  defaultMushaf: { id: number } | null,
  locale: string,
  dispatch: any,
) => {
  if (!defaultMushaf?.id) return;
  const { quranFont, mushafLines } = mapMushafToFontAndLines(defaultMushaf.id);
  dispatch(setQuranFont({ quranFont, locale }));
  if (mushafLines) {
    dispatch(setMushafLines({ mushafLines, locale }));
  }
};

/**
 * Updates the settings based on country preference data
 */
export const setDefaultsFromCountryPreference = createAsyncThunk<
  void,
  { countryPreference: CountryLanguagePreferenceResponse; locale: string },
  { state: RootState }
>(
  `${SliceName.DEFAULT_SETTINGS}/setDefaultsFromCountryPreference`,
  async ({ countryPreference, locale }, { dispatch }) => {
    const {
      defaultMushaf,
      defaultTranslations,
      defaultTafsir,
      defaultWbwLanguage,
      ayahReflectionsLanguages,
      learningPlanLanguages,
    } = countryPreference;

    applyMushafSettings(defaultMushaf, locale, dispatch);

    if (defaultTranslations?.length) {
      const translationIds = defaultTranslations.map((t) => t.id);
      dispatch(setSelectedTranslations({ translations: translationIds, locale }));
    }

    if (defaultTafsir?.id) {
      dispatch(setSelectedTafsirs({ tafsirs: [String(defaultTafsir.id)], locale }));
    }

    if (defaultWbwLanguage?.isoCode) {
      dispatch(setSelectedWordByWordLocale({ value: defaultWbwLanguage.isoCode, locale }));
    }

    // Store the reflection languages from country preference
    if (ayahReflectionsLanguages?.length) {
      // Map ISO codes to ReflectionLanguage enum
      const isoCodeMapping: Record<string, ReflectionLanguage> = {
        en: ReflectionLanguage.ENGLISH,
        ar: ReflectionLanguage.ARABIC,
        ur: ReflectionLanguage.URDU,
        fr: ReflectionLanguage.FRENCH,
        ms: ReflectionLanguage.MALAY,
        id: ReflectionLanguage.MALAY, // Indonesian maps to Malay
        es: ReflectionLanguage.SPANISH,
      };

      const reflectionLanguages = ayahReflectionsLanguages
        .map((lang) => isoCodeMapping[lang.isoCode])
        .filter(Boolean) as ReflectionLanguage[];

      // Always include English as default
      if (!reflectionLanguages.includes(ReflectionLanguage.ENGLISH)) {
        reflectionLanguages.unshift(ReflectionLanguage.ENGLISH);
      }

      dispatch(setAyahReflectionsLanguages(reflectionLanguages));
    }

    const learningPlanLanguageIsoCodes = normalizeLearningPlanLanguageIsoCodes(
      learningPlanLanguages?.map((lang) => lang.isoCode) || [],
    );
    dispatch(setLearningPlanLanguageIsoCodes(learningPlanLanguageIsoCodes));

    dispatch(setDetectedCountry(countryPreference.country));
    dispatch(setDetectedLanguage(countryPreference.userDeviceLanguage));
  },
);

/**
 * Reset settings to defaults by re-detecting locale and fetching country preferences
 */
export const resetDefaultSettings = createAsyncThunk<void, string, { state: RootState }>(
  `${SliceName.DEFAULT_SETTINGS}/resetDefaultSettings`,
  async (currentLocale, { dispatch }) => {
    // Use the browser's navigator language and accept-language headers for detection
    const acceptLanguageHeader = navigator.language || 'en';
    // Note: We can't access Cloudflare headers on client-side, so we'll use undefined
    const { detectedLanguage, detectedCountry } = detectUserLanguageAndCountry(
      acceptLanguageHeader,
      undefined,
    );

    // Fetch the country language preference for the detected locale
    const countryPreference = await getCountryLanguagePreference(detectedLanguage, detectedCountry);

    // Apply the new default settings
    await dispatch(
      setDefaultsFromCountryPreference({
        countryPreference,
        locale: detectedLanguage,
      }),
    );

    // Reset the userHasCustomised flag to false
    dispatch(setUserHasCustomised(false));

    // Dispatch the reset settings event to trigger the middleware
    // This will set isUsingDefaultSettings to true
    dispatch(resetSettings(detectedLanguage));
  },
);

export const defaultSettingsSlice = createSlice({
  name: SliceName.DEFAULT_SETTINGS,
  initialState,
  reducers: {
    setIsUsingDefaultSettings: (state: DefaultSettings, action: PayloadAction<boolean>) => ({
      ...state,
      isUsingDefaultSettings: action.payload,
    }),
    setDetectedCountry: (state: DefaultSettings, action: PayloadAction<string>) => ({
      ...state,
      detectedCountry: action.payload,
    }),
    setDetectedLanguage: (state: DefaultSettings, action: PayloadAction<string>) => ({
      ...state,
      detectedLanguage: action.payload,
    }),
    setUserHasCustomised: (state: DefaultSettings, action: PayloadAction<boolean>) => ({
      ...state,
      userHasCustomised: action.payload,
    }),
    setAyahReflectionsLanguages: (
      state: DefaultSettings,
      action: PayloadAction<ReflectionLanguage[]>,
    ) => ({
      ...state,
      ayahReflectionsLanguages: action.payload,
    }),
    setLearningPlanLanguageIsoCodes: (state: DefaultSettings, action: PayloadAction<string[]>) => ({
      ...state,
      learningPlanLanguageIsoCodes: normalizeLearningPlanLanguageIsoCodes(action.payload),
    }),
  },
});

export const persistCurrentSettings = createAsyncThunk<void, void, { state: RootState }>(
  `${SliceName.DEFAULT_SETTINGS}/persistCurrentSettings`,
  async (payload, { getState }) => {
    const state = getState();
    const preferenceSettings = stateToPreferenceGroups(state);

    const { quranReaderStyles } = preferenceSettings;
    const { mushaf } = getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines);

    await addOrUpdateBulkUserPreferences(preferenceSettings, mushaf);
  },
);

export const persistDefaultSettings = createAsyncThunk<void, string, { state: RootState }>(
  `${SliceName.DEFAULT_SETTINGS}/persistDefaultSettings`,
  async (locale) => {
    const localeDefaultSettings = stateToPreferenceGroups({
      ...getLocaleInitialState(locale),
      [SliceName.LOCALE]: locale,
    });

    const { quranReaderStyles } = localeDefaultSettings;
    const { mushaf } = getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines);

    await addOrUpdateBulkUserPreferences(localeDefaultSettings, mushaf);
  },
);

export const {
  setIsUsingDefaultSettings,
  setDetectedCountry,
  setDetectedLanguage,
  setUserHasCustomised,
  setAyahReflectionsLanguages,
  setLearningPlanLanguageIsoCodes,
} = defaultSettingsSlice.actions;

export default defaultSettingsSlice.reducer;

export const selectIsUsingDefaultSettings = (state: RootState) =>
  state.defaultSettings.isUsingDefaultSettings;

export const selectDetectedCountry = (state: RootState) => state.defaultSettings.detectedCountry;

export const selectDetectedLanguage = (state: RootState) => state.defaultSettings.detectedLanguage;

export const selectUserHasCustomised = (state: RootState) =>
  state.defaultSettings.userHasCustomised;

export const selectAyahReflectionsLanguages = (state: RootState) =>
  state.defaultSettings.ayahReflectionsLanguages;

export const selectLearningPlanLanguageIsoCodes = (state: RootState) =>
  state.defaultSettings.learningPlanLanguageIsoCodes;
