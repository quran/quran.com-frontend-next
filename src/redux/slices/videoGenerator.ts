import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '@/redux/RootState';
import SliceName from '@/redux/types/SliceName';
import {
  Alignment,
  DEFAULT_BACKGROUND_COLOR_ID,
  DEFAULT_FONT_COLOR,
  DEFAULT_OPACITY,
  DEFAULT_QURAN_FONT_SCALE,
  DEFAULT_RECITER_ID,
  DEFAULT_SHOULD_HAVE_BORDER,
  DEFAULT_TRANSLATION,
  DEFAULT_TRANSLATION_FONT_SCALE,
  Orientation,
} from '@/utils/videoGenerator/constants';

export type VideoGeneratorSettings = {
  opacity: string;
  shouldHaveBorder: string;
  fontColor: string;
  backgroundColorId: number;
  reciter: number;
  quranTextFontScale: number;
  translationFontScale: number;
  translations: number[];
  verseAlignment: Alignment;
  translationAlignment: Alignment;
  orientation: Orientation;
};

const initialState: VideoGeneratorSettings = {
  opacity: DEFAULT_OPACITY,
  shouldHaveBorder: DEFAULT_SHOULD_HAVE_BORDER,
  backgroundColorId: DEFAULT_BACKGROUND_COLOR_ID,
  reciter: DEFAULT_RECITER_ID,
  quranTextFontScale: DEFAULT_QURAN_FONT_SCALE,
  translationFontScale: DEFAULT_TRANSLATION_FONT_SCALE,
  translations: [DEFAULT_TRANSLATION],
  fontColor: DEFAULT_FONT_COLOR,
  verseAlignment: Alignment.CENTRE,
  translationAlignment: Alignment.CENTRE,
  orientation: Orientation.LANDSCAPE,
};

export const videoGeneratorSlice = createSlice({
  name: SliceName.VIDEO_GENERATOR,
  initialState,
  reducers: {
    updateSettings: (
      state: VideoGeneratorSettings,
      action: PayloadAction<Partial<VideoGeneratorSettings>>,
    ) => {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
});

export const { updateSettings } = videoGeneratorSlice.actions;

export const selectVideoGeneratorSettings = (state: RootState) => state.videoGenerator;
export const selectOpacity = (state: RootState) => state.videoGenerator.opacity;
export const selectShouldHaveBorder = (state: RootState) => state.videoGenerator.shouldHaveBorder;
export const selectReciter = (state: RootState) => state.videoGenerator.reciter;
export const selectQuranTextFontScale = (state: RootState) =>
  state.videoGenerator.quranTextFontScale;
export const selectFontColor = (state: RootState) => state.videoGenerator.fontColor;
export const selectTranslationFontScale = (state: RootState) =>
  state.videoGenerator.translationFontScale;
export const selectBackgroundColorId = (state: RootState) => state.videoGenerator.backgroundColorId;
export const selectTranslations = (state: RootState) => state.videoGenerator.translations;
export const selectVerseAlignment = (state: RootState) => state.videoGenerator.verseAlignment;
export const selectTranslationAlignment = (state: RootState) =>
  state.videoGenerator.translationAlignment;
export const selectOrientation = (state: RootState) => state.videoGenerator.orientation;

export default videoGeneratorSlice.reducer;
