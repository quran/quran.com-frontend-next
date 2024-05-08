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
  DEFAULT_SURAH,
  DEFAULT_TRANSLATION,
  DEFAULT_TRANSLATION_FONT_SCALE,
  DEFAULT_VIDEO_ID,
  Orientation,
} from '@/utils/media/constants';

export type MediaMakerSettings = {
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
  videoId: number;
  surah: number;
  verseFrom: string;
  verseTo: string;
};

const initialState: MediaMakerSettings = {
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
  videoId: DEFAULT_VIDEO_ID,
  surah: DEFAULT_SURAH,
  verseFrom: `${DEFAULT_SURAH}:1`,
  verseTo: `${DEFAULT_SURAH}:1`,
};

export const mediaGeneratorSlice = createSlice({
  name: SliceName.MEDIA_MAKER,
  initialState,
  reducers: {
    updateSettings: (
      state: MediaMakerSettings,
      action: PayloadAction<Partial<MediaMakerSettings>>,
    ) => {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
});

export const { updateSettings } = mediaGeneratorSlice.actions;

export const selectMediaMakerSettings = (state: RootState) => state.mediaMaker;
export const selectOpacity = (state: RootState) => state.mediaMaker.opacity;
export const selectShouldHaveBorder = (state: RootState) => state.mediaMaker.shouldHaveBorder;
export const selectReciter = (state: RootState) => state.mediaMaker.reciter;
export const selectQuranTextFontScale = (state: RootState) => state.mediaMaker.quranTextFontScale;
export const selectFontColor = (state: RootState) => state.mediaMaker.fontColor;
export const selectTranslationFontScale = (state: RootState) =>
  state.mediaMaker.translationFontScale;
export const selectBackgroundColorId = (state: RootState) => state.mediaMaker.backgroundColorId;
export const selectTranslations = (state: RootState) => state.mediaMaker.translations;
export const selectVerseAlignment = (state: RootState) => state.mediaMaker.verseAlignment;
export const selectTranslationAlignment = (state: RootState) =>
  state.mediaMaker.translationAlignment;
export const selectOrientation = (state: RootState) => state.mediaMaker.orientation;
export const selectVideoId = (state: RootState) => state.mediaMaker.videoId;
export const selectSurah = (state: RootState) => state.mediaMaker.surah;
export const selectVerseFrom = (state: RootState) => state.mediaMaker.verseFrom;
export const selectVerseTo = (state: RootState) => state.mediaMaker.verseTo;

export default mediaGeneratorSlice.reducer;
