import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { getTafsirsInitialState } from 'src/redux/defaultSettings/util';
import { RootState } from 'src/redux/RootState';
import resetSettings from 'src/redux/slices/reset-settings';
import { areArraysEqual } from 'src/utils/array';

export const tafsirsSlice = createSlice({
  name: 'tafsirs',
  initialState: getTafsirsInitialState(),
  reducers: {
    setSelectedTafsirs: (state, action: PayloadAction<{ tafsirs: number[]; locale: string }>) => ({
      ...state,
      // we need to before we compare because there is a corner case when the user changes the default tafsirs then re-selects them which results in the same array as the default one but reversed e.g. instead of [20, 131] it becomes [131, 20].
      isUsingDefaultTafsirs: areArraysEqual(
        getTafsirsInitialState(action.payload.locale).selectedTafsirs,
        action.payload.tafsirs,
      ), // check if the user is using the default tafsirs on each tafsir change.
      selectedTafsirs: action.payload.tafsirs,
    }),
  },
  // reset the tafsirs to initial state
  // when reset action is dispatched
  extraReducers: (builder) => {
    builder.addCase(resetSettings, (state, action) => {
      return getTafsirsInitialState(action.payload.locale);
    });
  },
});

export const { setSelectedTafsirs } = tafsirsSlice.actions;

export const selectSelectedTafsirs = (state: RootState) => state.tafsirs.selectedTafsirs;
export const selectIsUsingDefaultTafsirs = (state: RootState) =>
  state.tafsirs.isUsingDefaultTafsirs;

export default tafsirsSlice.reducer;
