import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '../RootState';

import SliceName from '@/redux/types/SliceName';

export type BannerState = {
  isBannerVisible: boolean;
};

const initialState: BannerState = {
  isBannerVisible: true,
};

export const bannerSlice = createSlice({
  name: SliceName.BANNER,
  initialState,
  reducers: {
    setIsBannerVisible: (state: BannerState, action: PayloadAction<boolean>) => ({
      ...state,
      isBannerVisible: action.payload,
    }),
  },
});

export const { setIsBannerVisible } = bannerSlice.actions;

export const selectIsBannerVisible = (state: RootState) => state.banner.isBannerVisible;

export default bannerSlice.reducer;
