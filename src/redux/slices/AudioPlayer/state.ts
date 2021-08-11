import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getAudioFile, getVerseTimestamps } from 'src/api';
import { AudioFile } from 'types/AudioFile';
import Reciter from 'types/Reciter';

const DEFAULT_RECITER = {
  id: 5,
  name: 'Mishari Rashid al-`Afasy',
  recitationStyle: 'Warsh',
  relativePath: 'mishaari_raashid_al_3afaasee',
};

export type AudioState = {
  isPlaying: boolean;
  currentTime: number;
  reciter: Reciter;
  audioFile: AudioFile;
};

const initialState: AudioState = {
  isPlaying: false,
  currentTime: 0,
  audioFile: null,
  reciter: DEFAULT_RECITER,
};

export const selectAudioPlayerState = (state) => state.audioPlayerState;
export const selectReciter = (state) => state.audioPlayerState.reciter;
export const selectAudioFile = (state) => state.audioPlayerState.audioFile;

/**
 * get the audio file for the current reciter
 * and set the value to redux state
 *
 * @param {number} chapter the chapter id
 *
 */
export const setAudioFile = createAsyncThunk<AudioFile, number>(
  'audioPlayerState/setAudioFile',
  async (chapter, thunkAPI) => {
    const reciter = selectReciter(thunkAPI.getState());

    const res = await getAudioFile(reciter.id, chapter);
    if (res.status === 500) {
      throw new Error('server error: fail to get audio file');
    }
    const firstAudio = res.audioFiles[0];
    if (!firstAudio) {
      throw new Error('No audio file found');
    }

    return firstAudio;
  },
);

export const playVerse = createAsyncThunk<number, string>(
  'audioPlayerState/setAudioTime',
  async (verseKey, thunkApi) => {
    const reciter = selectReciter(thunkApi.getState());
    const timeStamp = await getVerseTimestamps(reciter?.id, verseKey);
    return timeStamp.result.timestampFrom / 1000;
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
  },
  extraReducers: (builder) => {
    builder.addCase(setAudioFile.fulfilled, (state, action: PayloadAction<AudioFile>) => ({
      ...state,
      audioFile: action.payload,
    }));
    builder.addCase(playVerse.fulfilled, (state, action: PayloadAction<number>) => ({
      ...state,
      currentTime: action.payload,
    }));
  },
});

export const { setIsPlaying, setCurrentTime, setReciter } = audioPlayerStateSlice.actions;

export default audioPlayerStateSlice.reducer;
