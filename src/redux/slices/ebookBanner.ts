import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '../RootState';

import SliceName from '@/redux/types/SliceName';

export type EbookBannerState = {
  isHomepageBannerVisible: boolean;
  isReflectionsBannerVisible: boolean;
  isLessonsBannerVisible: boolean;
};

const initialState: EbookBannerState = {
  isHomepageBannerVisible: true,
  isReflectionsBannerVisible: true,
  isLessonsBannerVisible: true,
};

export const ebookBannerSlice = createSlice({
  name: SliceName.EBOOK_BANNER,
  initialState,
  reducers: {
    setIsHomepageEbookBannerVisible: (state: EbookBannerState, action: PayloadAction<boolean>) => ({
      ...state,
      isHomepageBannerVisible: action.payload,
    }),
    setIsReflectionsEbookBannerVisible: (
      state: EbookBannerState,
      action: PayloadAction<boolean>,
    ) => ({
      ...state,
      isReflectionsBannerVisible: action.payload,
    }),
    setIsLessonsEbookBannerVisible: (state: EbookBannerState, action: PayloadAction<boolean>) => ({
      ...state,
      isLessonsBannerVisible: action.payload,
    }),
  },
});

export const {
  setIsHomepageEbookBannerVisible,
  setIsReflectionsEbookBannerVisible,
  setIsLessonsEbookBannerVisible,
} = ebookBannerSlice.actions;

export const selectIsHomepageEbookBannerVisible = (state: RootState) =>
  state.ebookBanner.isHomepageBannerVisible ?? true;

export const selectIsReflectionsEbookBannerVisible = (state: RootState) =>
  state.ebookBanner.isReflectionsBannerVisible ?? true;

export const selectIsLessonsEbookBannerVisible = (state: RootState) =>
  state.ebookBanner.isLessonsBannerVisible ?? true;

export default ebookBannerSlice.reducer;
