/* eslint-disable max-lines */
// TODO: remove eslint-disable max lines and breakdown the file
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { DEFAULT_RECITER } from './defaultData';

import { getChapterAudioFile } from 'src/api';
import {
  triggerPlayAudio,
  triggerSetCurrentTime,
  triggerPauseAudio,
} from 'src/components/AudioPlayer/EventTriggers';
import { RootState } from 'src/redux/RootState';
import resetSettings from 'src/redux/slices/reset-settings';
import AudioFile from 'types/AudioFile';
import Reciter from 'types/Reciter';
import VerseTiming from 'types/VerseTiming';

export enum AudioFileStatus {
  Ready = 'Ready',
  Loading = 'Loading',
  NoFile = 'NoFile',
}

export type AudioState = {
  isPlaying: boolean;
  reciter: Reciter;
  audioFile: AudioFile;
  audioFileStatus: AudioFileStatus;
  isMobileMinimizedForScrolling: boolean;
  enableAutoScrolling: boolean;
  repeatSettings: {
    // TODO: add typing
    repeatRange: number;
    repeatEachVerse: number;
    from: string;
    to: string;
    delayMultiplierBetweenVerse: number;
  };
};

const initialState: AudioState = {
  enableAutoScrolling: true,
  isPlaying: false,
  audioFile: null,
  reciter: DEFAULT_RECITER,
  audioFileStatus: AudioFileStatus.NoFile,
  isMobileMinimizedForScrolling: false,
  repeatSettings: {
    delayMultiplierBetweenVerse: 0,
    repeatRange: 1,
    repeatEachVerse: 1,
    from: null,
    to: null,
  },
};

export const selectAudioPlayerState = (state: RootState) => state.audioPlayerState;
export const selectReciter = (state: RootState) => state.audioPlayerState.reciter;
export const selectIsUsingDefaultReciter = (state: RootState) =>
  state.audioPlayerState.reciter.id === DEFAULT_RECITER.id;
export const selectAudioFile = (state: RootState) => state.audioPlayerState.audioFile;
export const selectAudioFileStatus = (state: RootState) => state.audioPlayerState.audioFileStatus;
export const selectIsPlaying = (state: RootState) => state.audioPlayerState.isPlaying;
export const selectIsMobileMinimizedForScrolling = (state: RootState) =>
  state.audioPlayerState.isMobileMinimizedForScrolling;
export const selectEnableAutoScrolling = (state: RootState) =>
  state.audioPlayerState.enableAutoScrolling;
export const selectRepeatSettings = (state: RootState) => state.audioPlayerState.repeatSettings;

/**
 * get the audio file for the current reciter
 * set the value to redux state
 * and play the audio file
 *
 * @param {number} chapter the chapter id
 *
 */
export const loadAndPlayAudioFile = createAsyncThunk<void, number, { state: RootState }>(
  'audioPlayerState/loadAndPlayAudioFile',
  async (chapter, thunkAPI) => {
    // play directly the audio file for this chapter is already loaded.
    const currentAudioFile = selectAudioFile(thunkAPI.getState());
    if (currentAudioFile && currentAudioFile.chapterId === chapter) {
      triggerPlayAudio();
      return;
    }

    thunkAPI.dispatch(setAudioStatus(AudioFileStatus.Loading));

    const reciter = selectReciter(thunkAPI.getState());
    const audioFile = await getChapterAudioFile(reciter.id, chapter);

    thunkAPI.dispatch(setAudioFile(audioFile));

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
    thunkAPI.dispatch(setAudioStatus(AudioFileStatus.Loading));
    triggerPauseAudio();
    thunkAPI.dispatch(setReciter(reciter));

    const state = thunkAPI.getState();
    const audioFile = await getChapterAudioFile(reciter.id, selectAudioFile(state).chapterId);
    thunkAPI.dispatch(setAudioFile(audioFile));
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
  verseKey: string;
  chapterId: number;
  reciterId: number;
}
export const playFrom = createAsyncThunk<void, PlayFromInput, { state: RootState }>(
  'audioPlayerState/playFrom',
  async ({ verseKey, chapterId, reciterId }, thunkApi) => {
    const state = thunkApi.getState();
    const reciter = selectReciter(state);
    let audioFile = selectAudioFile(state);
    if (!audioFile || audioFile.chapterId !== chapterId || reciter.id !== reciterId) {
      thunkApi.dispatch(setAudioStatus(AudioFileStatus.Loading));
      audioFile = await getChapterAudioFile(reciter.id, chapterId);
      thunkApi.dispatch(setAudioFile(audioFile));
    }

    const timestampsData = await getChapterAudioFile(reciterId, chapterId, true);
    const verseTiming = getVerseTimingByVerseKey(verseKey, timestampsData.verseTimings);
    const playWhenReady = () => {
      const timestampInSeconds = verseTiming.timestampFrom / 1000;
      triggerSetCurrentTime(timestampInSeconds);
      triggerPlayAudio();
      window.audioPlayerEl.removeEventListener('canplaythrough', playWhenReady);
    };

    window.audioPlayerEl.addEventListener('canplaythrough', playWhenReady);
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
    setAudioFile: (state: AudioState, action: PayloadAction<AudioFile>) => ({
      ...state,
      audioFile: action.payload,
    }),
    setAudioStatus: (state, action: PayloadAction<AudioFileStatus>) => ({
      ...state,
      audioFileStatus: action.payload,
    }),
    setEnableAutoScrolling: (state, action: PayloadAction<boolean>) => ({
      ...state,
      enableAutoScrolling: action.payload,
    }),
    resetAudioFile: (state) => ({
      ...state,
      audioFile: initialState.audioFile,
      audioFileStatus: initialState.audioFileStatus,
    }),
    setRepeatSettings: (state, action) => ({
      ...state,
      repeatSettings: action.payload,
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
  setAudioFile,
  setAudioStatus,
  resetAudioFile,
  setIsMobileMinimizedForScrolling,
  setEnableAutoScrolling,
  setRepeatSettings,
} = audioPlayerStateSlice.actions;

export const getVerseTimingByVerseKey = (verseKey: string, verseTimings: VerseTiming[]) => {
  return verseTimings.find((verseTiming) => verseTiming.verseKey === verseKey);
};

export default audioPlayerStateSlice.reducer;
