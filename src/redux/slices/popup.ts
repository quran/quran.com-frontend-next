import { createSlice } from '@reduxjs/toolkit';

import { RootState } from '../RootState';

export type PopupState = {
  sessionCount: number;
};

const initialState: PopupState = {
  sessionCount: 0,
};

export const popupSlice = createSlice({
  name: 'popup',
  initialState,
  reducers: {
    incrementSessionCount: (state: PopupState) => ({
      ...state,
      sessionCount: state.sessionCount + 1,
    }),
  },
});

export const { incrementSessionCount } = popupSlice.actions;

export const selectSessionCount = (state: RootState) => state.popup.sessionCount;

export default popupSlice.reducer;
