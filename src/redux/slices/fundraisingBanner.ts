import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '../RootState';

import SliceName from '@/redux/types/SliceName';

export type FundraisingBannerState = {
  isHomepageBannerVisible: boolean;
  isQuranReaderBannerVisible: boolean;
  isQuranReaderFloatingBannerVisible: boolean;
};

const initialState: FundraisingBannerState = {
  isHomepageBannerVisible: true,
  isQuranReaderBannerVisible: true,
  isQuranReaderFloatingBannerVisible: true,
};

export const fundraisingBannerSlice = createSlice({
  name: SliceName.FUNDRAISING_BANNER,
  initialState,
  reducers: {
    setIsHomepageBannerVisible: (
      state: FundraisingBannerState,
      action: PayloadAction<boolean>,
    ) => ({
      ...state,
      isHomepageBannerVisible: action.payload,
    }),
    setIsQuranReaderBannerVisible: (
      state: FundraisingBannerState,
      action: PayloadAction<boolean>,
    ) => ({
      ...state,
      isQuranReaderBannerVisible: action.payload,
    }),
    setIsQuranReaderFloatingBannerVisible: (
      state: FundraisingBannerState,
      action: PayloadAction<boolean>,
    ) => ({
      ...state,
      isQuranReaderFloatingBannerVisible: action.payload,
    }),
  },
});

export const {
  setIsHomepageBannerVisible,
  setIsQuranReaderBannerVisible,
  setIsQuranReaderFloatingBannerVisible,
} = fundraisingBannerSlice.actions;

export const selectIsHomepageBannerVisible = (state: RootState) =>
  state.fundraisingBanner.isHomepageBannerVisible ?? true;

export const selectIsQuranReaderBannerVisible = (state: RootState) =>
  state.fundraisingBanner.isQuranReaderBannerVisible ?? true;

export const selectIsQuranReaderFloatingBannerVisible = (state: RootState) =>
  state.fundraisingBanner.isQuranReaderFloatingBannerVisible ??
  state.fundraisingBanner.isQuranReaderBannerVisible ??
  true;

export default fundraisingBannerSlice.reducer;
