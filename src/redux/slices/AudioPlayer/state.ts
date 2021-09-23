/* eslint-disable max-lines */
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { DEFAULT_RECITER } from './defaultData';

import { getChapterAudioFile } from 'src/api';
import {
  triggerPlayAudio,
  triggerSetCurrentTime,
  triggerPauseAudio,
} from 'src/components/AudioPlayer/EventTriggers';
import { RootState } from 'src/redux/RootState';
import { selectHighlightedLocation } from 'src/redux/slices/QuranReader/highlightedLocation';
import resetSettings from 'src/redux/slices/reset-settings';
import { makeVerseKey } from 'src/utils/verse';
import AudioFile from 'types/AudioFile';
import Reciter from 'types/Reciter';

export enum AudioFileStatus {
  Ready = 'Ready',
  Loading = 'Loading',
  NoFile = 'NoFile',
}

export enum VerseAudioStatus {
  Playing = 'playing',
  Paused = 'paused',
  Loading = 'loading',
}

export type AudioState = {
  isPlaying: boolean;
  reciter: Reciter;
  audioFile: AudioFile;
  audioFileStatus: AudioFileStatus;
  isExpanded: boolean;
  isMobileMinimizedForScrolling: boolean;
};

const initialState: AudioState = {
  isPlaying: false,
  audioFile: null,
  reciter: DEFAULT_RECITER,
  audioFileStatus: AudioFileStatus.NoFile,
  isExpanded: false,
  isMobileMinimizedForScrolling: false,
};

export const selectAudioPlayerState = (state: RootState) => state.audioPlayerState;
export const selectReciter = (state: RootState) => state.audioPlayerState.reciter;
export const selectIsUsingDefaultReciter = (state: RootState) =>
  state.audioPlayerState.reciter.id === DEFAULT_RECITER.id;
export const selectAudioFile = (state: RootState) => state.audioPlayerState.audioFile;
export const selectAudioFileStatus = (state: RootState) => state.audioPlayerState.audioFileStatus;
export const selectIsPlaying = (state: RootState) => state.audioPlayerState.isPlaying;
export const selectIsExpanded = (state: RootState) => state.audioPlayerState.isExpanded;
export const selectIsMobileMinimizedForScrolling = (state: RootState) =>
  state.audioPlayerState.isMobileMinimizedForScrolling;
export const selectVerseAudioStatus =
  (verseKey: string) =>
  (state: RootState): VerseAudioStatus => {
    const { highlightedChapter, highlightedVerse } = selectHighlightedLocation(state);
    const audioFileStatus = selectAudioFileStatus(state);
    const isAudioPlaying = selectIsPlaying(state);

    const isVerseHighlighted = makeVerseKey(highlightedChapter, highlightedVerse) === verseKey;

    if (isVerseHighlighted && audioFileStatus === AudioFileStatus.Loading)
      return VerseAudioStatus.Loading;
    if (isVerseHighlighted && isAudioPlaying) return VerseAudioStatus.Playing;

    return VerseAudioStatus.Paused;
  };

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
  timestamp: number;
  chapterId: number;
  reciterId: number;
}
export const playFrom = createAsyncThunk<void, PlayFromInput, { state: RootState }>(
  'audioPlayerState/playFrom',
  async ({ timestamp, chapterId, reciterId }, thunkApi) => {
    const state = thunkApi.getState();
    const reciter = selectReciter(state);
    let audioFile = selectAudioFile(state);
    if (!audioFile || audioFile.chapterId !== chapterId || reciter.id !== reciterId) {
      thunkApi.dispatch(setAudioStatus(AudioFileStatus.Loading));
      audioFile = await getChapterAudioFile(reciter.id, chapterId);
      thunkApi.dispatch(setAudioFile(audioFile));
    }

    const timestampInSeconds = timestamp / 1000;
    triggerSetCurrentTime(timestampInSeconds);

    triggerPlayAudio();
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
    setIsExpanded: (state, action: PayloadAction<boolean>) => ({
      ...state,
      isExpanded: action.payload,
    }),
    resetAudioFile: (state) => ({
      ...state,
      audioFile: initialState.audioFile,
      audioFileStatus: initialState.audioFileStatus,
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
  setIsExpanded,
  resetAudioFile,
  setIsMobileMinimizedForScrolling,
} = audioPlayerStateSlice.actions;

export default audioPlayerStateSlice.reducer;
