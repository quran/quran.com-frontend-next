/* eslint-disable max-lines */
// TODO: remove eslint-disable max lines and breakdown the file
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { getChapterAudioData } from 'src/api';
import {
  triggerPlayAudio,
  triggerPauseAudio,
  playFromTimestamp,
} from 'src/components/AudioPlayer/EventTriggers';
import { getAudioPlayerStateInitialState } from 'src/redux/defaultSettings/util';
import { RootState } from 'src/redux/RootState';
import resetSettings from 'src/redux/slices/reset-settings';
import AudioDataStatus from 'src/redux/types/AudioDataStatus';
import AudioState from 'src/redux/types/AudioState';
import { getVerseTimingByVerseKey } from 'src/utils/audio';
import AudioData from 'types/AudioData';
import Reciter from 'types/Reciter';

export const selectAudioPlayerState = (state: RootState) => state.audioPlayerState;
export const selectReciter = (state: RootState) => state.audioPlayerState.reciter;
export const selectIsUsingDefaultReciter = (state: RootState) =>
  state.audioPlayerState.isUsingDefaultReciter;
export const selectAudioData = (state: RootState) => state.audioPlayerState.audioData;
export const selectAudioDataStatus = (state: RootState) => state.audioPlayerState.audioDataStatus;
export const selectIsPlaying = (state: RootState) => state.audioPlayerState.isPlaying;
export const selectIsMobileMinimizedForScrolling = (state: RootState) =>
  state.audioPlayerState.isMobileMinimizedForScrolling;
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
export const selectRemainingRangeRepeatCount = (state: RootState) => {
  const { repeatProgress, repeatSettings } = state.audioPlayerState;
  return 1 + (repeatSettings.repeatRange - repeatProgress.repeatRange);
  // +1 to account for the current cycle, current implementation doesn't account for the current cycle
};
export const selectShowTooltipWhenPlayingAudio = (state: RootState) =>
  state.audioPlayerState.showTooltipWhenPlayingAudio;

/**
 * get the audio file for the current reciter
 * set the value to redux state
 * and play the audio file
 *
 * @param {number} chapter the chapter id
 *
 */
export const loadAndPlayAudioData = createAsyncThunk<void, number, { state: RootState }>(
  'audioPlayerState/loadAndPlayAudioData',
  async (chapter, thunkAPI) => {
    // play directly the audio file for this chapter is already loaded.
    const currentAudioData = selectAudioData(thunkAPI.getState());
    if (currentAudioData && currentAudioData.chapterId === chapter) {
      triggerPlayAudio();
      return;
    }

    thunkAPI.dispatch(setAudioStatus(AudioDataStatus.Loading));

    const reciter = selectReciter(thunkAPI.getState());
    const audioData = await getChapterAudioData(reciter.id, chapter);

    thunkAPI.dispatch(setAudioData(audioData));

    triggerPlayAudio();
  },
);

/**
 * 1) pause the audio player
 * 2) get the audio file based on current reciter + chapter
 * 3) set the audio file to redux state
 *
 * @param {Reciter} reciter
 */
export const setReciterAndPauseAudio = createAsyncThunk<
  void,
  { reciter: Reciter; locale: string },
  { state: RootState }
>('audioPlayerState/setReciterAndPlayAudio', async ({ reciter, locale }, thunkAPI) => {
  thunkAPI.dispatch(setAudioStatus(AudioDataStatus.Loading));
  triggerPauseAudio();
  thunkAPI.dispatch(setReciter({ reciter, locale }));

  const state = thunkAPI.getState();
  const audioData = await getChapterAudioData(reciter.id, selectAudioData(state).chapterId);
  thunkAPI.dispatch(setAudioData(audioData));
});

/**
 * get the timestamp for the the verseKey
 * and then play it and update the redux state
 *
 * @param {number} verseKey example 1:1 -> al-fatihah verse 1
 *
 */
interface PlayFromInput {
  verseKey?: string;
  chapterId: number;
  reciterId: number;
  timestamp?: number;
}
export const playFrom = createAsyncThunk<void, PlayFromInput, { state: RootState }>(
  'audioPlayerState/playFrom',
  async ({ verseKey, chapterId, reciterId, timestamp }, thunkApi) => {
    const state = thunkApi.getState();
    const selectedReciter = selectReciter(state);
    let selectedAudioData = selectAudioData(state);
    if (
      !selectedAudioData ||
      selectedAudioData.chapterId !== chapterId ||
      selectedReciter.id !== reciterId
    ) {
      thunkApi.dispatch(setAudioStatus(AudioDataStatus.Loading));
      selectedAudioData = await getChapterAudioData(reciterId, chapterId);
      thunkApi.dispatch(setAudioData(selectedAudioData));
      window.audioPlayerEl.load(); // load the audio file, it's not preloaded on safari mobile https://stackoverflow.com/questions/49792768/js-html5-audio-why-is-canplaythrough-not-fired-on-ios-safari
    }

    // if `timestamp` is not provided, we need to get the timestamp data for the verseKey by fetching it from the API
    if (timestamp === undefined || timestamp === null) {
      const timestampsData = await getChapterAudioData(reciterId, chapterId, true);
      const verseTiming = getVerseTimingByVerseKey(verseKey, timestampsData.verseTimings);
      playFromTimestamp(verseTiming.timestampFrom / 1000);
      return;
    }
    playFromTimestamp(timestamp / 1000);
  },
);

export const audioPlayerStateSlice = createSlice({
  name: 'audioPlayerState',
  initialState: getAudioPlayerStateInitialState(),
  reducers: {
    setIsPlaying: (state: AudioState, action: PayloadAction<boolean>) => ({
      ...state,
      isPlaying: action.payload,
    }),
    setIsMobileMinimizedForScrolling: (state, action: PayloadAction<boolean>) => ({
      ...state,
      isMobileMinimizedForScrolling: action.payload,
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
  },
  // reset reciter to the default based on the locale
  // WHEN `reset` action is dispatched
  extraReducers: (builder) => {
    builder.addCase(resetSettings, (state, action) => ({
      ...state,
      isUsingDefaultReciter: true,
      reciter: getAudioPlayerStateInitialState(action.payload.locale).reciter,
    }));
  },
});

export const {
  setIsPlaying,
  setReciter,
  setAudioData,
  setAudioStatus,
  resetAudioData,
  setIsMobileMinimizedForScrolling,
  setEnableAutoScrolling,
  setRepeatSettings,
  setRepeatProgress,
  exitRepeatMode,
  setIsDownloadingAudio,
  finishRepeatEachVerseProgress,
  resetRepeatEachVerseProgress,
  setPlaybackRate,
  setShowTooltipWhenPlayingAudio,
} = audioPlayerStateSlice.actions;

export default audioPlayerStateSlice.reducer;
