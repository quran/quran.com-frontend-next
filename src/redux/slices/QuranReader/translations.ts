import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export const DEFAULT_TRANSLATIONS = [20, 131];

export type TranslationsSettings = {
  selectedTranslations: number[];
  isUsingDefaultTranslations: boolean;
};

/**
 * This is to detect whether the user has changed the default translations or not on each translation change.
 * The user will have changed the default translations in 2 cases:
 *  1. the length of the array of IDs of the translations the user has selected differs from the length of the array of default IDs.
 *  2. the length of both arrays are the same but one ID exists in one but not in the other.
 *
 * [NOTE]: We could have used the easier JSON.stringify(DEFAULT_TRANSLATIONS) === JSON.stringify(newTranslations)
 *         comparison but there is a corner case when the user changes the default translations then
 *         re-selects them which results in the same array as the default one but reversed
 *         e.g. instead of [20, 131] it becomes [131, 20] and the JSON comparison will fail
 *         although the BE API's response will have the translations in the same order in both cases
 *         which is by ID ascendingly (e.g. 20 then 131 even if we set the translations' param as "131, 20").
 * @param {number[]} newTranslations
 * @returns {boolean}
 */
const isUsingDefaultTranslations = (newTranslations: number[]): boolean => {
  // if the lengths are different, it means the user has changed the default translations.
  if (newTranslations.length !== DEFAULT_TRANSLATIONS.length) {
    return false;
  }
  for (let i = 0; i < newTranslations.length; i += 1) {
    // if the current translation ID is not inside the default IDs' array, it means the user has changed the default translations.
    if (DEFAULT_TRANSLATIONS.indexOf(newTranslations[i]) === -1) {
      return false;
    }
  }
  return true;
};

const initialState: TranslationsSettings = {
  selectedTranslations: DEFAULT_TRANSLATIONS,
  isUsingDefaultTranslations: true,
};

export const translationsSlice = createSlice({
  name: 'translations',
  initialState,
  reducers: {
    setSelectedTranslations: (state, action: PayloadAction<number[]>) => ({
      ...state,
      isUsingDefaultTranslations: isUsingDefaultTranslations(action.payload), // check if the user is using the default translations on each translation change.
      selectedTranslations: action.payload,
    }),
  },
});

export const { setSelectedTranslations } = translationsSlice.actions;

export const selectTranslations = (state) => state.translations;

export default translationsSlice.reducer;
