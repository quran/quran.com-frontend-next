import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '@/redux/RootState';
import SliceName from '@/redux/types/SliceName';
import ThemeTypeVariant from '@/redux/types/ThemeTypeVariant';
import type { MushafType } from '@/types/ayah-widget';

export type AyahWidgetOverrides = {
  containerId?: string;
  selectedSurah?: number;
  selectedAyah?: number;
  translationIds?: number[];
  theme?: ThemeTypeVariant;
  mushaf?: MushafType;
  enableAudio?: boolean;
  enableWbwTranslation?: boolean;
  showTranslatorName?: boolean;
  showTafsirs?: boolean;
  showReflections?: boolean;
  showAnswers?: boolean;
  locale?: string;
  reciter?: number | null;
  showArabic?: boolean;
  rangeEnabled?: boolean;
  rangeEnd?: number;
  customSize?: {
    width?: string;
    height?: string;
  };
};

type AyahWidgetState = {
  overrides: AyahWidgetOverrides;
};

const initialState: AyahWidgetState = {
  overrides: {},
};

export const ayahWidgetSlice = createSlice({
  name: SliceName.AYAH_WIDGET,
  initialState,
  reducers: {
    updateAyahWidgetOverrides: (state, action: PayloadAction<AyahWidgetOverrides>) => ({
      ...state,
      // Merge user overrides so they persist across sessions.
      overrides: { ...state.overrides, ...action.payload },
    }),
    resetAyahWidgetOverrides: () => initialState,
  },
});

export const { updateAyahWidgetOverrides, resetAyahWidgetOverrides } = ayahWidgetSlice.actions;

export const selectAyahWidgetOverrides = (state: RootState) => state.ayahWidget.overrides;

export default ayahWidgetSlice.reducer;
