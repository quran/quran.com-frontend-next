import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { REHYDRATE } from 'redux-persist';

import resetSettings from '@/redux/actions/reset-settings';
import syncUserPreferences from '@/redux/actions/sync-user-preferences';
import { getAudioPlayerStateInitialState } from '@/redux/defaultSettings/util';
import { RootState } from '@/redux/RootState';
import AudioState from '@/redux/types/AudioState';
import SliceName from '@/redux/types/SliceName';
import PreferenceGroup from 'types/auth/PreferenceGroup';

export const selectAudioPlayerState = (state: RootState) => state.audioPlayerState;
export const selectEnableAutoScrolling = (state: RootState) =>
  state.audioPlayerState.enableAutoScrolling;
export const selectIsDownloadingAudio = (state: RootState) =>
  state.audioPlayerState.isDownloadingAudio;
export const selectShowTooltipWhenPlayingAudio = (state: RootState) =>
  state.audioPlayerState.showTooltipWhenPlayingAudio;

export const audioPlayerStateSlice = createSlice({
  name: SliceName.AUDIO_PLAYER_STATE,
  initialState: getAudioPlayerStateInitialState(),
  reducers: {
    setEnableAutoScrolling: (state, action: PayloadAction<boolean>) => ({
      ...state,
      enableAutoScrolling: action.payload,
    }),
    setIsDownloadingAudio: (state, action: PayloadAction<boolean>) => ({
      ...state,
      isDownloadingAudio: action.payload,
    }),
    setShowTooltipWhenPlayingAudio: (state, action: PayloadAction<boolean>) => ({
      ...state,
      showTooltipWhenPlayingAudio: action.payload,
    }),
  },
  // reset reciter to the default based on the locale
  // WHEN `reset` action is dispatched
  extraReducers: (builder) => {
    builder.addCase(resetSettings, (state, action) => ({
      ...state,
      ...getAudioPlayerStateInitialState(action.payload.locale),
    }));
    builder.addCase(syncUserPreferences, (state, action) => {
      const {
        payload: { userPreferences },
      } = action;
      const remotePreferences = userPreferences[PreferenceGroup.AUDIO] as AudioState;
      if (remotePreferences) {
        return {
          ...state,
          ...remotePreferences,
        };
      }
      return state;
    });
    // listen to redux-persist's REHYDRATE event
    builder.addCase(REHYDRATE, (state, action) => {
      // @ts-ignore
      const { key, payload } = action;
      /**
       * There is an issue with redux-persists (https://github.com/rt2zz/redux-persist/issues/290)
       * that converts Infinite to null which affects when the user chooses to
       * repeat a verse(s) infinitely and leads to repeatRange being persisted
       * as null which is an invalid value so we need to convert it back to Infinity.
       */
      if (key === SliceName.AUDIO_PLAYER_STATE && payload?.repeatSettings?.repeatRange === null) {
        return {
          ...state,
          ...payload,
        };
      }
      return { ...state, ...payload };
    });
  },
});

export const { setEnableAutoScrolling, setIsDownloadingAudio, setShowTooltipWhenPlayingAudio } =
  audioPlayerStateSlice.actions;

export default audioPlayerStateSlice.reducer;
