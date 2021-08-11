import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getAudioFile, getVerseTimestamps } from 'src/api';
import { AudioFile } from 'types/AudioFile';
import Reciter from 'types/Reciter';

export type AudioState = {
  isPlaying: boolean;
  currentTime: number;
  reciter: Reciter;
  audio: AudioFile;
};

const initialState: AudioState = {
  isPlaying: false,
  currentTime: 0,
  audio: null,
  reciter: {
    id: 5,
    name: 'Mishari Rashid al-`Afasy',
    recitationStyle: 'Warsh',
    relativePath: 'mishaari_raashid_al_3afaasee',
  },
};

export const selectAudioPlayerState = (state) => state.audioPlayerState;
export const selectReciter = (state) => state.audioPlayerState.reciter;
export const selectAudioUrl = (state) => state.audioPlayerState.audio;

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
  'setAudioTime',
  async (verseKey, thunkApi) => {
    const reciter = selectReciter(thunkApi.getState());
    const timeStamp = await getVerseTimestamps(reciter?.id, verseKey);
    return timeStamp.result.timestampFrom;
  },
);

export const audioPlayerStateSlice = createSlice({
  name: 'audioPlayerState',
  initialState,
  reducers: {
    setIsPlaying: (state: AudioState, action: PayloadAction<boolean>) => {
      return {
        ...state,
        isPlaying: action.payload,
      };
    },
    setReciter: (state, action: PayloadAction<Reciter>) => {
      return {
        ...state,
        reciter: action.payload,
      };
    },
    setChapter: (state, action: PayloadAction<number>) => {
      return { ...state, chapter: action.payload };
    },
    setCurrentTime: (state: AudioState, action: PayloadAction<number>) => {
      return {
        ...state,
        currentTime: action.payload,
      };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(setAudioFile.fulfilled, (state, action: PayloadAction<AudioFile>) => {
      return {
        ...state,
        audio: action.payload,
      };
    });
    builder.addCase(playVerse.fulfilled, (state, action: PayloadAction<number>) => {
      return {
        ...state,
        currentTime: action.payload,
      };
    });
  },
});

export const {
  setIsPlaying,
  setCurrentTime,
  setReciter,
  setChapter,
} = audioPlayerStateSlice.actions;

export default audioPlayerStateSlice.reducer;
