import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '../RootState';

import SliceName from '@/redux/types/SliceName';

export const initialState = {
  isVisible: true,
};

export const welcomeMessageSlice = createSlice({
  name: SliceName.WELCOME_MESSAGE,
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
