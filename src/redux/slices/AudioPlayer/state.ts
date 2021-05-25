import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type AudioState = {
  isPlaying: boolean;
  currentTime: number;
};

const initialState: AudioState = { isPlaying: false, currentTime: 0 };

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
    setCurrentTime: (state: AudioState, action: PayloadAction<number>) => {
      return {
        ...state,
        currentTime: action.payload,
      };
    },
  },
});

export const { setIsPlaying, setCurrentTime } = audioPlayerStateSlice.actions;

export const selectAudioPlayerState = (state) => state.audioPlayerState;

export default audioPlayerStateSlice.reducer;
