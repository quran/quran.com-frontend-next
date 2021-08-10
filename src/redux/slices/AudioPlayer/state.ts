import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type Reciter = {
  id: number;
  url: string;
  name: string;
};

export type AudioState = {
  isPlaying: boolean;
  currentTime: number;
  reciter?: Reciter;
};

const initialState: AudioState = { isPlaying: false, currentTime: 0, reciter: null };

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
    setCurrentTime: (state: AudioState, action: PayloadAction<number>) => {
      return {
        ...state,
        currentTime: action.payload,
      };
    },
  },
});

export const { setIsPlaying, setCurrentTime, setReciter } = audioPlayerStateSlice.actions;

export const selectAudioPlayerState = (state) => state.audioPlayerState;
export const selectReciter = (state) => state.reciter;

export default audioPlayerStateSlice.reducer;
