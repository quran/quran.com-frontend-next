import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '../RootState';

import SliceName from '@/redux/types/SliceName';

export type SessionState = {
  count: number;
  isDonationPopupVisible: boolean;
};

const initialState: SessionState = {
  count: 0,
  isDonationPopupVisible: true,
};

export const sessionSlice = createSlice({
  name: SliceName.SESSION,
  initialState,
  reducers: {
    incrementSessionCount: (state: SessionState) => ({
      ...state,
      count: state.count + 1,
    }),
    setIsDonationPopupVisible: (state: SessionState, action: PayloadAction<boolean>) => ({
      ...state,
      isDonationPopupVisible: action.payload,
    }),
  },
});

export const { incrementSessionCount, setIsDonationPopupVisible } = sessionSlice.actions;

export const selectSessionCount = (state: RootState) => state.session.count;

export const selectIsDonationPopupVisible = (state: RootState) =>
  state.session.isDonationPopupVisible;

export default sessionSlice.reducer;
