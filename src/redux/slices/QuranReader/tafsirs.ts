import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import resetSettings from '@/redux/actions/reset-settings';
import syncUserPreferences from '@/redux/actions/sync-user-preferences';
import { getTafsirsInitialState } from '@/redux/defaultSettings/util';
import { RootState } from '@/redux/RootState';
import SliceName from '@/redux/types/SliceName';
import TafsirsSettings from '@/redux/types/TafsirsSettings';
import { areArraysEqual } from '@/utils/array';
import PreferenceGroup from 'types/auth/PreferenceGroup';

export const tafsirsSlice = createSlice({
  name: SliceName.TAFSIRS,
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
        payload: { userPreferences, locale },
      } = action;
      const remotePreferences = userPreferences[PreferenceGroup.TAFSIRS] as TafsirsSettings;
      if (remotePreferences) {
        const { selectedTafsirs: defaultTafsirs } = getTafsirsInitialState(locale);
        const { selectedTafsirs: remoteTafsirs } = remotePreferences;
        return {
          ...state,
          ...remotePreferences,
          isUsingDefaultTafsirs: areArraysEqual(defaultTafsirs, remoteTafsirs),
        };
      }
      return state;
    });
  },
});

export const { setSelectedTafsirs } = tafsirsSlice.actions;

export const selectTafsirs = (state: RootState) => state.tafsirs;
export const selectSelectedTafsirs = (state: RootState) => state.tafsirs.selectedTafsirs;
export const selectIsUsingDefaultTafsirs = (state: RootState) =>
  state.tafsirs.isUsingDefaultTafsirs;

export default tafsirsSlice.reducer;
