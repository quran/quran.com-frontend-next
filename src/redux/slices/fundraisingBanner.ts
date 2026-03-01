import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '../RootState';

import SliceName from '@/redux/types/SliceName';

export type FundraisingBannerState = {
  isHomepageBannerVisible: boolean;
  isQuranReaderBannerVisible: boolean;
};

const initialState: FundraisingBannerState = {
  isHomepageBannerVisible: true,
  isQuranReaderBannerVisible: true,
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
  },
});

export const { setIsHomepageBannerVisible, setIsQuranReaderBannerVisible } =
  fundraisingBannerSlice.actions;

export const selectIsHomepageBannerVisible = (state: RootState) =>
  state.fundraisingBanner.isHomepageBannerVisible;

export const selectIsQuranReaderBannerVisible = (state: RootState) =>
  state.fundraisingBanner.isQuranReaderBannerVisible;

export default fundraisingBannerSlice.reducer;
