import { ReadingPreference } from 'types/QuranReader';

/**
 * Check if the given reading preference is a "Reading" mode (either Arabic or Translation).
 * This distinguishes between "Verse by Verse" mode (Translation enum) and the two "Reading" modes.
 *
 * @param {ReadingPreference} preference - The reading preference to check
 * @returns {boolean} true if the preference is Reading or ReadingTranslation
 */
const isInReadingMode = (preference: ReadingPreference): boolean =>
  preference === ReadingPreference.Reading || preference === ReadingPreference.ReadingTranslation;

export default isInReadingMode;
