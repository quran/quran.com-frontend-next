import { createSlice } from '@reduxjs/toolkit';

import { RootState } from '../RootState';

export type PopupState = {
  count: number;
};

const initialState: PopupState = {
  count: 0,
};

export const popupSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    incrementSessionCount: (state: PopupState) => ({
      ...state,
      count: state.count + 1,
    }),
  },
});

export const { incrementSessionCount } = popupSlice.actions;

export const selectSessionCount = (state: RootState) => state.session.count;

export default popupSlice.reducer;
