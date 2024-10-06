import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '@/redux/RootState';
import SliceName from '@/redux/types/SliceName';
import Alignment from '@/types/Media/Alignment';
import MediaSettings from '@/types/Media/MediaSettings';
import Orientation from '@/types/Media/Orientation';
import {
  DEFAULT_BACKGROUND_COLOR,
  DEFAULT_BORDER_COLOR,
  DEFAULT_BORDER_SIZE,
  DEFAULT_FONT_COLOR,
  DEFAULT_OPACITY,
  DEFAULT_QURAN_FONT_SCALE,
  DEFAULT_QURAN_FONT_STYLE,
  DEFAULT_RECITER_ID,
  DEFAULT_SURAH,
  DEFAULT_TRANSLATION,
  DEFAULT_TRANSLATION_FONT_SCALE,
  DEFAULT_VIDEO_ID,
} from '@/utils/media/constants';

const initialState: MediaSettings = {
  opacity: DEFAULT_OPACITY,
  borderColor: DEFAULT_BORDER_COLOR,
  borderSize: DEFAULT_BORDER_SIZE,
  backgroundColor: DEFAULT_BACKGROUND_COLOR,
  reciter: DEFAULT_RECITER_ID,
  quranTextFontScale: DEFAULT_QURAN_FONT_SCALE,
  translationFontScale: DEFAULT_TRANSLATION_FONT_SCALE,
  quranTextFontStyle: DEFAULT_QURAN_FONT_STYLE,
  translations: [DEFAULT_TRANSLATION],
  fontColor: DEFAULT_FONT_COLOR,
  verseAlignment: Alignment.CENTRE,
  translationAlignment: Alignment.CENTRE,
  orientation: Orientation.PORTRAIT,
  videoId: DEFAULT_VIDEO_ID,
  surah: DEFAULT_SURAH,
  verseFrom: '1',
  verseTo: '1',
};

export const mediaGeneratorSlice = createSlice({
  name: SliceName.MEDIA_MAKER,
  initialState,
  reducers: {
    updateSettings: (state: MediaSettings, action: PayloadAction<Partial<MediaSettings>>) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    resetToDefaults: (state: MediaSettings) => {
      return {
        ...state,
        ...initialState,
      };
    },
  },
});

export const { updateSettings, resetToDefaults } = mediaGeneratorSlice.actions;

export const selectMediaMakerSettings = (state: RootState) => state.mediaMaker;
export const selectOpacity = (state: RootState) => state.mediaMaker.opacity;
export const selectReciter = (state: RootState) => state.mediaMaker.reciter;
export const selectQuranTextFontScale = (state: RootState) => state.mediaMaker.quranTextFontScale;
export const selectFontColor = (state: RootState) => state.mediaMaker.fontColor;
export const selectTranslationFontScale = (state: RootState) =>
  state.mediaMaker.translationFontScale;
export const selectQuranTextFontStyle = (state: RootState) => state.mediaMaker.quranTextFontStyle;
export const selectTranslations = (state: RootState) => state.mediaMaker.translations;
export const selectVerseAlignment = (state: RootState) => state.mediaMaker.verseAlignment;
export const selectTranslationAlignment = (state: RootState) =>
  state.mediaMaker.translationAlignment;
export const selectOrientation = (state: RootState) => state.mediaMaker.orientation;
export const selectVideoId = (state: RootState) => state.mediaMaker.videoId;
export const selectSurah = (state: RootState) => state.mediaMaker.surah;
export const selectSurahAndVersesFromAndTo = (state: RootState) => ({
  verseFrom: state.mediaMaker.verseFrom,
  verseTo: state.mediaMaker.verseTo,
  surah: state.mediaMaker.surah,
});
export const selectBorderColor = (state: RootState) => state.mediaMaker.borderColor;
export const selectBorderSize = (state: RootState) => state.mediaMaker.borderSize;
export const selectBackgroundColor = (state: RootState) => state.mediaMaker.backgroundColor;

export default mediaGeneratorSlice.reducer;
