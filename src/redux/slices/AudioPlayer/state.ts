import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// TODO: The filesize is getting big. need to split into another file

type Reciter = {
  id: number;
  name: string;
};

export type Audio = {
  url: string;
  totalDuration: number;
};

export type AudioState = {
  isPlaying: boolean;
  currentTime: number;
  reciter?: Reciter;
  audio: Audio;
  chapter: number;
};

const initialState: AudioState = {
  isPlaying: false,
  currentTime: 0,
  reciter: null,
  chapter: 1,
  audio: {
    url: '',
    totalDuration: 0,
  },
};

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
    setAudio: (state, action: PayloadAction<Audio>) => {
      return {
        ...state,
        audio: action.payload,
      };
    },
    setCurrentTime: (state: AudioState, action: PayloadAction<number>) => {
      return {
        ...state,
        currentTime: action.payload,
      };
    },
  },
});

export const selectAudioPlayerState = (state) => state.audioPlayerState;
export const selectReciter = (state) => state.audioPlayerState.reciter;
export const selectChapter = (state) => state.audioPlayerState.chapter;

export const {
  setIsPlaying,
  setCurrentTime,
  setReciter,
  setAudio,
  setChapter,
} = audioPlayerStateSlice.actions;

export default audioPlayerStateSlice.reducer;
