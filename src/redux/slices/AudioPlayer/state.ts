/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable max-lines */
// TODO: remove eslint-disable max lines and breakdown the file
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { REHYDRATE } from 'redux-persist';

import resetSettings from 'src/redux/actions/reset-settings';
import syncUserPreferences from 'src/redux/actions/sync-user-preferences';
import { getAudioPlayerStateInitialState } from 'src/redux/defaultSettings/util';
import { RootState } from 'src/redux/RootState';
import AudioDataStatus from 'src/redux/types/AudioDataStatus';
import AudioState from 'src/redux/types/AudioState';
import SliceName from 'src/redux/types/SliceName';
import AudioData from 'types/AudioData';
import PreferenceGroup from 'types/auth/PreferenceGroup';
import Reciter from 'types/Reciter';

export const selectAudioPlayerState = (state: RootState) => state.audioPlayerState;
export const selectReciter = (state: RootState) => state.audioPlayerState.reciter;
export const selectReciterId = (state: RootState) => state.audioPlayerState.reciter.id;
export const selectIsUsingDefaultReciter = (state: RootState) =>
  state.audioPlayerState.isUsingDefaultReciter;
export const selectAudioData = (state: RootState) => state.audioPlayerState.audioData;
export const selectAudioDataStatus = (state: RootState) => state.audioPlayerState.audioDataStatus;
export const selectEnableAutoScrolling = (state: RootState) =>
  state.audioPlayerState.enableAutoScrolling;
export const selectPlaybackRate = (state: RootState) => state.audioPlayerState.playbackRate;
export const selectRepeatSettings = (state: RootState) => state.audioPlayerState.repeatSettings;
export const selectRepeatProgress = (state: RootState) => state.audioPlayerState.repeatProgress;
export const selectIsInRepeatMode = (state: RootState) => {
  const { repeatSettings } = state.audioPlayerState;
  return !!repeatSettings.from && !!repeatSettings.to;
};
export const selectIsDownloadingAudio = (state: RootState) =>
  state.audioPlayerState.isDownloadingAudio;
export const selectShowTooltipWhenPlayingAudio = (state: RootState) =>
  state.audioPlayerState.showTooltipWhenPlayingAudio;

export const audioPlayerStateSlice = createSlice({
  name: SliceName.AUDIO_PLAYER_STATE,
  initialState: getAudioPlayerStateInitialState(),
  reducers: {
    setIsPlaying: (state: AudioState, action: PayloadAction<boolean>) => ({
      ...state,
      isPlaying: action.payload,
    }),
    setReciter: (state, action: PayloadAction<{ reciter: Reciter; locale: string }>) => ({
      ...state,
      isUsingDefaultReciter:
        getAudioPlayerStateInitialState(action.payload.locale).reciter.id ===
        action.payload.reciter.id,
      reciter: action.payload.reciter,
    }),
    setAudioData: (state: AudioState, action: PayloadAction<AudioData>) => ({
      ...state,
      audioData: action.payload,
    }),
    setAudioStatus: (state, action: PayloadAction<AudioDataStatus>) => ({
      ...state,
      audioDataStatus: action.payload,
    }),
    setEnableAutoScrolling: (state, action: PayloadAction<boolean>) => ({
      ...state,
      enableAutoScrolling: action.payload,
    }),
    resetAudioData: (state, action: PayloadAction<string>) => ({
      ...state,
      audioData: getAudioPlayerStateInitialState(action.payload).audioData,
      audioDataStatus: getAudioPlayerStateInitialState(action.payload).audioDataStatus,
    }),
    setRepeatSettings: (state, action) => ({
      ...state,
      repeatSettings: { ...action.payload.verseRepetition },
      // reset the repeat progress when we set the new repeat settings
      repeatProgress: { ...getAudioPlayerStateInitialState(action.payload.locale).repeatProgress },
    }),
    setRepeatProgress: (state, action) => ({
      ...state,
      repeatProgress: {
        ...state.repeatProgress,
        ...action.payload,
      },
    }),
    finishRepeatEachVerseProgress: (state) => ({
      ...state,
      repeatProgress: {
        ...state.repeatProgress,
        repeatEachVerse: state.repeatSettings.repeatEachVerse,
      },
    }),
    resetRepeatEachVerseProgress: (state, action: PayloadAction<string>) => ({
      ...state,
      repeatProgress: {
        ...state.repeatProgress,
        repeatEachVerse: getAudioPlayerStateInitialState(action.payload).repeatSettings
          .repeatEachVerse,
      },
    }),
    exitRepeatMode: (state) => ({
      ...state,
      repeatSettings: {
        ...state.repeatSettings,
        from: null,
        to: null,
      },
    }),
    setIsDownloadingAudio: (state, action: PayloadAction<boolean>) => ({
      ...state,
      isDownloadingAudio: action.payload,
    }),
    setPlaybackRate: (state, action: PayloadAction<number>) => ({
      ...state,
      playbackRate: action.payload,
    }),
    setShowTooltipWhenPlayingAudio: (state, action: PayloadAction<boolean>) => ({
      ...state,
      showTooltipWhenPlayingAudio: action.payload,
    }),
    setIsRadioMode: (state, action: PayloadAction<boolean>) => ({
      ...state,
      isRadioMode: action.payload,
    }),
  },
  // reset reciter to the default based on the locale
  // WHEN `reset` action is dispatched
  extraReducers: (builder) => {
    builder.addCase(resetSettings, (state, action) => ({
      ...state,
      isUsingDefaultReciter: true,
      reciter: getAudioPlayerStateInitialState(action.payload.locale).reciter,
    }));
    builder.addCase(syncUserPreferences, (state, action) => {
      const {
        payload: { userPreferences, locale },
      } = action;
      const remotePreferences = userPreferences[PreferenceGroup.AUDIO] as AudioState;
      if (remotePreferences) {
        const {
          reciter: { id: defaultReciterId },
        } = getAudioPlayerStateInitialState(locale);
        return {
          ...state,
          ...remotePreferences,
          isUsingDefaultReciter: remotePreferences.reciter.id === defaultReciterId,
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
          repeatSettings: {
            ...state.repeatSettings,
            ...payload.repeatSettings,
            repeatRange: Infinity,
          },
        };
      }
      return { ...state, ...payload };
    });
  },
});

export const {
  setIsPlaying,
  setReciter,
  setAudioData,
  setAudioStatus,
  resetAudioData,
  setEnableAutoScrolling,
  setRepeatSettings,
  setRepeatProgress,
  exitRepeatMode,
  setIsDownloadingAudio,
  finishRepeatEachVerseProgress,
  resetRepeatEachVerseProgress,
  setPlaybackRate,
  setShowTooltipWhenPlayingAudio,
  setIsRadioMode,
} = audioPlayerStateSlice.actions;

export default audioPlayerStateSlice.reducer;
