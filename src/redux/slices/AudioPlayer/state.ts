import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getAudioFile } from 'src/api';
import { triggerPlayAudio, triggerSetCurrentTime } from 'src/components/AudioPlayer/EventTriggers';
import { getChapterNumberFromKey } from 'src/utils/verse';
import { AudioFile } from 'types/AudioFile';
import Reciter from 'types/Reciter';
import Verse from 'types/Verse';

const DEFAULT_RECITER = {
  id: 5,
  name: 'Mishari Rashid al-`Afasy',
  recitationStyle: 'Warsh',
  relativePath: 'mishaari_raashid_al_3afaasee',
};

export enum AudioFileStatus {
  Ready = 'Ready',
  Loading = 'Loading',
  NoFile = 'NoFile',
}

export type AudioState = {
  isPlaying: boolean;
  currentTime: number;
  reciter: Reciter;
  audioFile: AudioFile;
  audioFileStatus: AudioFileStatus;
  isMinimized: boolean;
};

const initialState: AudioState = {
  isPlaying: false,
  currentTime: 0,
  audioFile: null,
  reciter: DEFAULT_RECITER,
  audioFileStatus: AudioFileStatus.NoFile,
  isMinimized: false,
};

export const selectAudioPlayerState = (state) => state.audioPlayerState;
export const selectReciter = (state) => state.audioPlayerState.reciter;
export const selectAudioFile = (state) => state.audioPlayerState.audioFile as AudioFile;
export const selectAudioFileStatus = (state) => state.audioPlayerState.audioFileStatus;
export const selectIsPlaying = (state) => state.audioPlayerState.isPlaying;
export const selectIsMinimized = (state) => state.audioPlayerState.isMinimized;

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
export const playVerse = createAsyncThunk<void, Verse>(
  'audioPlayerState/setAudioTime',
  async (verse, thunkApi) => {
    const state = thunkApi.getState();
    const reciter = selectReciter(state);
    let audioFile = selectAudioFile(state);
    const chapter = getChapterNumberFromKey(verse.verseKey);
    if (!audioFile || audioFile.chapterId !== chapter) {
      thunkApi.dispatch(setAudioStatus(AudioFileStatus.Loading));
      audioFile = await getAudioFile(reciter.id, chapter);
      thunkApi.dispatch(setAudioFile(audioFile));
    }

    const timeStampInSecond = verse.timestamps?.timestampFrom / 1000;
    triggerSetCurrentTime(timeStampInSecond);
    thunkApi.dispatch(setCurrentTime(timeStampInSecond));

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
    setIsMinimized: (state, action: PayloadAction<boolean>) => ({
      ...state,
      isMinimized: action.payload,
    }),
  },
});

export const {
  setIsPlaying,
  setCurrentTime,
  setReciter,
  setAudioFile,
  setAudioStatus,
  setIsMinimized,
} = audioPlayerStateSlice.actions;

export default audioPlayerStateSlice.reducer;
