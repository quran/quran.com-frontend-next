import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from 'src/redux/RootState';
import resetSettings from 'src/redux/slices/reset-settings';
import { areArraysEqual } from 'src/utils/array';

// English Mokhtasar and Tafsir Ibn Kathir in English
export const DEFAULT_TAFSIRS = [171, 169];

type TafsirsSettings = {
  selectedTafsirs: number[];
  isUsingDefaultTafsirs: boolean;
};

const initialState: TafsirsSettings = {
  selectedTafsirs: DEFAULT_TAFSIRS,
  isUsingDefaultTafsirs: true,
};

export const tafsirsSlice = createSlice({
  name: 'tafsirs',
  initialState,
  reducers: {
    setSelectedTafsirs: (state, action: PayloadAction<number[]>) => ({
      ...state,
      // we need to before we compare because there is a corner case when the user changes the default tafsirs then re-selects them which results in the same array as the default one but reversed e.g. instead of [20, 131] it becomes [131, 20].
      isUsingDefaultTafsirs: areArraysEqual(DEFAULT_TAFSIRS, action.payload), // check if the user is using the default tafsirs on each tafsir change.
      selectedTafsirs: action.payload,
    }),
  },
  // reset the tafsirs to initial state
  // when reset action is dispatched
  extraReducers: (builder) => {
    builder.addCase(resetSettings, () => initialState);
  },
});

export const { setSelectedTafsirs } = tafsirsSlice.actions;

export const selectSelectedTafsirs = (state: RootState) => state.tafsirs.selectedTafsirs;
export const selectIsUsingDefaultTafsirs = (state: RootState) =>
  state.tafsirs.isUsingDefaultTafsirs;

export default tafsirsSlice.reducer;
