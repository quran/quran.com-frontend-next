import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '../RootState';

export const initialState = {
  isVisible: true,
};

export const prayerTimes = createSlice({
  name: 'prayerTimes',
  initialState,
  reducers: {
    setCalculationMethod: (state, action: PayloadAction<boolean>) => ({
      ...state,
      isVisible: action.payload,
    }),
  },
});

export const selectWelcomeMessage = (state: RootState) => state.welcomeMessage;
export const { setCalculationMethod: setIsVisible } = prayerTimes.actions;
export default prayerTimes.reducer;
