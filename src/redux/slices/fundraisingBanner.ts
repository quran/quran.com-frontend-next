import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '../RootState';

import SliceName from '@/redux/types/SliceName';

export type FundraisingBannerState = {
  isHomepageBannerVisible: boolean;
};

const initialState: FundraisingBannerState = {
  isHomepageBannerVisible: true,
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
  },
});

export const { setIsHomepageBannerVisible } = fundraisingBannerSlice.actions;

export const selectIsHomepageBannerVisible = (state: RootState) =>
  state.fundraisingBanner.isHomepageBannerVisible;

export default fundraisingBannerSlice.reducer;
