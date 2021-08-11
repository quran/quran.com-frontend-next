import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum AudioPlayerVisibility {
  Expanded = 'expanded',
  Minimized = 'minimized',
  Hidden = 'hidden',
}

export type Style = {
  visibility: AudioPlayerVisibility;
};

const initialState: Style = { visibility: AudioPlayerVisibility.Expanded };

export const audioPlayerStyleSlice = createSlice({
  name: 'audioPlayerStyle',
  initialState,
  reducers: {
    setVisibility: (state: Style, action: PayloadAction<AudioPlayerVisibility>) => ({
      ...state,
      visibility: action.payload,
    }),
  },
});

export const { setVisibility } = audioPlayerStyleSlice.actions;

export const selectAudioPlayerStyle = (state) => state.audioPlayerStyle;

export default audioPlayerStyleSlice.reducer;
