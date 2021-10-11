/* eslint-disable max-lines */
// TODO: remove eslint-disable max lines and breakdown the file
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { DEFAULT_RECITER } from './defaultData';

import { getChapterAudioData } from 'src/api';
import {
  triggerPlayAudio,
  triggerPauseAudio,
  playFromTimestamp,
} from 'src/components/AudioPlayer/EventTriggers';
import { RootState } from 'src/redux/RootState';
import resetSettings from 'src/redux/slices/reset-settings';
import { getVerseTimingByVerseKey } from 'src/utils/audio';
import AudioData from 'types/AudioData';
import Reciter from 'types/Reciter';

export enum AudioDataStatus {
  Ready = 'Ready',
  Loading = 'Loading',
  NoFile = 'NoFile',
}

export type RepeatSettings = {
  repeatRange: number;
  repeatEachVerse: number;
  from: string;
  to: string;
  delayMultiplier: number;
};

export type RepeatProgress = {
  repeatEachVerse: number;
  repeatRange: number;
};

export type AudioState = {
  isPlaying: boolean;
  reciter: Reciter;
  audioData: AudioData;
  audioDataStatus: AudioDataStatus;
  isMobileMinimizedForScrolling: boolean;
  enableAutoScrolling: boolean;
  repeatSettings: RepeatSettings;
  repeatProgress: RepeatProgress;
  isDownloadingAudio: boolean;
};

export const defaultRepeatSettings = {
  delayMultiplier: 0,
  repeatRange: 3,
  repeatEachVerse: 1,
  from: null,
  to: null,
};

export const defaultRepeatProgress = {
  repeatEachVerse: 1,
  repeatRange: 1,
};

const initialState: AudioState = {
  enableAutoScrolling: true,
  isPlaying: false,
  audioData: null,
  reciter: DEFAULT_RECITER,
  audioDataStatus: AudioDataStatus.NoFile,
  isMobileMinimizedForScrolling: false,
  repeatSettings: defaultRepeatSettings,
  repeatProgress: defaultRepeatProgress,
  isDownloadingAudio: false,
};

export const selectAudioPlayerState = (state: RootState) => state.audioPlayerState;
export const selectReciter = (state: RootState) => state.audioPlayerState.reciter;
export const selectIsUsingDefaultReciter = (state: RootState) =>
  state.audioPlayerState.reciter.id === DEFAULT_RECITER.id;
export const selectAudioData = (state: RootState) => state.audioPlayerState.audioData;
export const selectAudioDataStatus = (state: RootState) => state.audioPlayerState.audioDataStatus;
export const selectIsPlaying = (state: RootState) => state.audioPlayerState.isPlaying;
export const selectIsMobileMinimizedForScrolling = (state: RootState) =>
  state.audioPlayerState.isMobileMinimizedForScrolling;
export const selectEnableAutoScrolling = (state: RootState) =>
  state.audioPlayerState.enableAutoScrolling;
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
export const setReciterAndPauseAudio = createAsyncThunk<void, Reciter, { state: RootState }>(
  'audioPlayerState/setReciterAndPlayAudio',
  async (reciter, thunkAPI) => {
    thunkAPI.dispatch(setAudioStatus(AudioDataStatus.Loading));
    triggerPauseAudio();
    thunkAPI.dispatch(setReciter(reciter));

    const state = thunkAPI.getState();
    const audioData = await getChapterAudioData(reciter.id, selectAudioData(state).chapterId);
    thunkAPI.dispatch(setAudioData(audioData));
  },
);

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
    const reciter = selectReciter(state);
    let audioData = selectAudioData(state);
    if (!audioData || audioData.chapterId !== chapterId || reciter.id !== reciterId) {
      thunkApi.dispatch(setAudioStatus(AudioDataStatus.Loading));
      audioData = await getChapterAudioData(reciter.id, chapterId);
      thunkApi.dispatch(setAudioData(audioData));
      window.audioPlayerEl.load(); // load the audio file, it's not preloaded on safari mobile https://stackoverflow.com/questions/49792768/js-html5-audio-why-is-canplaythrough-not-fired-on-ios-safari
    }

    // `timestamp` is not provided, we need to get the timestamp data for the verseKey by fetching it from the API
    if (!timestamp) {
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
  initialState,
  reducers: {
    setIsPlaying: (state: AudioState, action: PayloadAction<boolean>) => ({
      ...state,
      isPlaying: action.payload,
    }),
    setIsMobileMinimizedForScrolling: (state, action: PayloadAction<boolean>) => ({
      ...state,
      isMobileMinimizedForScrolling: action.payload,
    }),
    setReciter: (state, action: PayloadAction<Reciter>) => ({
      ...state,
      reciter: action.payload,
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
    resetAudioData: (state) => ({
      ...state,
      audioData: initialState.audioData,
      audioDataStatus: initialState.audioDataStatus,
    }),
    setRepeatSettings: (state, action) => ({
      ...state,
      repeatSettings: { ...action.payload },
      // reset the repeat progress when we set the new repeat settings
      repeatProgress: { ...initialState.repeatProgress },
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
    resetRepeatEachVerseProgress: (state) => ({
      ...state,
      repeatProgress: {
        ...state.repeatProgress,
        repeatEachVerse: defaultRepeatProgress.repeatEachVerse,
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
  },
  // reset reciter to DEFAULT_RECITER
  // WHEN `reset` action is dispatched
  extraReducers: (builder) => {
    builder.addCase(resetSettings, (state) => ({
      ...state,
      reciter: DEFAULT_RECITER,
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
} = audioPlayerStateSlice.actions;

export default audioPlayerStateSlice.reducer;
