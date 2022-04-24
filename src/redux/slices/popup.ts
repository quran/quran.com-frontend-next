import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '../RootState';

export type PopupState = {
  isPopupVisible: boolean;
};

const initialState: PopupState = {
  isPopupVisible: true,
};

export const popupSlice = createSlice({
  name: 'popup',
  initialState,
  reducers: {
    setIsPopupVisible: (state: PopupState, action: PayloadAction<boolean>) => ({
      ...state,
      isPopupVisible: action.payload,
    }),
  },
});

export const { setIsPopupVisible } = popupSlice.actions;

export const selectIsPopupVisible = (state: RootState) => state.popup.isPopupVisible;

export default popupSlice.reducer;
