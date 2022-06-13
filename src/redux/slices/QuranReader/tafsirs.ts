import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import resetSettings from 'src/redux/actions/reset-settings';
import syncUserPreferences from 'src/redux/actions/sync-user-preferences';
import { getTafsirsInitialState } from 'src/redux/defaultSettings/util';
import { RootState } from 'src/redux/RootState';
import { areArraysEqual } from 'src/utils/array';
import PreferenceGroup from 'types/auth/PreferenceGroup';

export const tafsirsSlice = createSlice({
  name: 'tafsirs',
  initialState: getTafsirsInitialState(),
  reducers: {
    setSelectedTafsirs: (state, action: PayloadAction<{ tafsirs: string[]; locale: string }>) => ({
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
    builder.addCase(syncUserPreferences, (state, action) => {
      const {
        payload: { userPreferences },
      } = action;
      if (userPreferences[PreferenceGroup.TAFSIR]) {
        return {
          ...state,
          ...userPreferences[PreferenceGroup.TAFSIR],
        };
      }
      return state;
    });
  },
});

export const { setSelectedTafsirs } = tafsirsSlice.actions;

export const selectSelectedTafsirs = (state: RootState) => state.tafsirs.selectedTafsirs;
export const selectIsUsingDefaultTafsirs = (state: RootState) =>
  state.tafsirs.isUsingDefaultTafsirs;

export default tafsirsSlice.reducer;
