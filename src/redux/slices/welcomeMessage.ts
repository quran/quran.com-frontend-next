import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '../RootState';

export const initialState = {
  isVisible: true,
};

export const welcomeMessageSlice = createSlice({
  name: 'welcomeMessage',
  initialState,
  reducers: {
    setIsVisible: (state, action: PayloadAction<boolean>) => ({
      ...state,
      isVisible: action.payload,
    }),
  },
});

export const selectWelcomeMessage = (state: RootState) => state.welcomeMessage;
export const { setIsVisible } = welcomeMessageSlice.actions;
export default welcomeMessageSlice.reducer;
