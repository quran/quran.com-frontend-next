import { ReadingPreference } from 'types/QuranReader';

const READING_MODE_QUERY_PARAM_VERSE_BY_VERSE = 'verse-by-verse';
const READING_MODE_QUERY_PARAM_ARABIC = 'arabic';
const READING_MODE_QUERY_PARAM_TRANSLATION = 'translation';

const READING_PREFERENCE_TO_QUERY_PARAM_VALUE = {
  [ReadingPreference.Translation]: READING_MODE_QUERY_PARAM_VERSE_BY_VERSE,
  [ReadingPreference.Reading]: READING_MODE_QUERY_PARAM_ARABIC,
  [ReadingPreference.ReadingTranslation]: READING_MODE_QUERY_PARAM_TRANSLATION,
} as const;

const QUERY_PARAM_VALUE_TO_READING_PREFERENCE = {
  [READING_MODE_QUERY_PARAM_VERSE_BY_VERSE]: ReadingPreference.Translation,
  [READING_MODE_QUERY_PARAM_ARABIC]: ReadingPreference.Reading,
  [READING_MODE_QUERY_PARAM_TRANSLATION]: ReadingPreference.ReadingTranslation,
} as const;

/**
 * Check if the given reading preference is a "Reading" mode (either Arabic or Translation).
 * This distinguishes between "Verse by Verse" mode (Translation enum) and the two "Reading" modes.
 *
 * @param {ReadingPreference} preference - The reading preference to check
 * @returns {boolean} true if the preference is Reading or ReadingTranslation
 */
const isInReadingMode = (preference: ReadingPreference): boolean =>
  preference === ReadingPreference.Reading || preference === ReadingPreference.ReadingTranslation;

export const getReadingModeQueryParamValue = (preference: ReadingPreference): string =>
  READING_PREFERENCE_TO_QUERY_PARAM_VALUE[preference];

export const getReadingPreferenceFromQueryParam = (value: string): ReadingPreference | undefined =>
  QUERY_PARAM_VALUE_TO_READING_PREFERENCE[value];

export const isValidReadingModeQueryParamValue = (value: string): boolean =>
  getReadingPreferenceFromQueryParam(value) !== undefined;

export default isInReadingMode;
