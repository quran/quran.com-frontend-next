import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getAudioFile } from 'src/api';
import { triggerPlayAudio, triggerSetCurrentTime } from 'src/components/AudioPlayer/EventTriggers';
import { AudioFile } from 'types/AudioFile';
import Reciter from 'types/Reciter';
import resetSettings from '../reset-settings';
import { DEFAULT_RECITER } from './defaultData';

export enum AudioFileStatus {
  Ready = 'Ready',
  Loading = 'Loading',
  NoFile = 'NoFile',
}

export enum Visibility {
  Minimized = 'Minimized',
  Default = 'Default',
  Expanded = 'Expanded',
}

export type AudioState = {
  isPlaying: boolean;
  currentTime: number;
  reciter: Reciter;
  audioFile: AudioFile;
  audioFileStatus: AudioFileStatus;
  visibility: Visibility;
};

const initialState: AudioState = {
  isPlaying: false,
  currentTime: 0,
  audioFile: null,
  reciter: DEFAULT_RECITER,
  audioFileStatus: AudioFileStatus.NoFile,
  visibility: Visibility.Default,
};

export const selectAudioPlayerState = (state) => state.audioPlayerState;
export const selectReciter = (state) => state.audioPlayerState.reciter as Reciter;
export const selectIsUsingDefaultReciter = (state) =>
  state.audioPlayerState.reciter.id === DEFAULT_RECITER.id;
export const selectAudioFile = (state) => state.audioPlayerState.audioFile as AudioFile;
export const selectAudioFileStatus = (state) => state.audioPlayerState.audioFileStatus;
export const selectIsPlaying = (state) => state.audioPlayerState.isPlaying;
export const selectVisibility = (state) => state.audioPlayerState.visibility;

/**
 * get the audio file for the current reciter
 * set the value to redux state
 * and play the audio file
 *
 * @param {number} chapter the chapter id
 *
 */
export const loadAndPlayAudioFile = createAsyncThunk<void, number>(
  'audioPlayerState/loadAndPlayAudioFile',
  async (chapter, thunkAPI) => {
    thunkAPI.dispatch(setAudioStatus(AudioFileStatus.Loading));

    const reciter = selectReciter(thunkAPI.getState());
    const audioFile = await getAudioFile(reciter.id, chapter);

    thunkAPI.dispatch(setAudioFile(audioFile));
    triggerPlayAudio();
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
export const playFrom = createAsyncThunk<void, PlayFromInput>(
  'audioPlayerState/playFrom',
  async ({ timestamp, chapterId, reciterId }, thunkApi) => {
    const state = thunkApi.getState();
    const reciter = selectReciter(state);
    let audioFile = selectAudioFile(state);
    if (!audioFile || audioFile.chapterId !== chapterId || reciter.id !== reciterId) {
      thunkApi.dispatch(setAudioStatus(AudioFileStatus.Loading));
      audioFile = await getAudioFile(reciter.id, chapterId);
      thunkApi.dispatch(setAudioFile(audioFile));
    }

    const timestampInSeconds = timestamp / 1000;
    thunkApi.dispatch(setCurrentTime(timestampInSeconds));
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
    setReciter: (state, action: PayloadAction<Reciter>) => ({
      ...state,
      reciter: action.payload,
    }),
    setCurrentTime: (state: AudioState, action: PayloadAction<number>) => ({
      ...state,
      currentTime: action.payload,
    }),
    setAudioFile: (state: AudioState, action: PayloadAction<AudioFile>) => ({
      ...state,
      audioFile: action.payload,
    }),
    setAudioStatus: (state, action: PayloadAction<AudioFileStatus>) => ({
      ...state,
      audioFileStatus: action.payload,
    }),
    setVisibility: (state, action: PayloadAction<Visibility>) => ({
      ...state,
      visibility: action.payload,
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
  setCurrentTime,
  setReciter,
  setAudioFile,
  setAudioStatus,
  setVisibility,
} = audioPlayerStateSlice.actions;

export default audioPlayerStateSlice.reducer;
