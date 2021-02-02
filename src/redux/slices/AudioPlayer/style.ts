import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum AudioPlayerVisibility {
  Expanded = 'expanded',
  Minimized = 'minimized',
  Hidden = 'hidden',
}

export type Style = {
  visibility: AudioPlayerVisibility;
};

const initialState: Style = { visibility: AudioPlayerVisibility.Hidden };

export const audioPlayerStyleSlice = createSlice({
  name: 'audioPlayerStyle',
  initialState,
  reducers: {
    setVisibility: (state: Style, action: PayloadAction<AudioPlayerVisibility>) => {
      return {
        ...state,
        visibility: action.payload,
      };
    },
  },
});

export const { setVisibility } = audioPlayerStyleSlice.actions;

export const selectAudioPlayerStyle = (state) => state.audioPlayerStyle;

export default audioPlayerStyleSlice.reducer;
