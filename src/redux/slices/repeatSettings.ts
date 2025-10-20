import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '@/redux/RootState';
import SliceName from '@/redux/types/SliceName';

export type RepetitionMode = 'single' | 'range' | 'chapter';

export interface CustomRange {
  mode: RepetitionMode;
  from: string;
  to: string;
}

export interface RepeatSettingsState {
  repeatRange: number;
  repeatEachVerse: number;
  delayMultiplier: number;
  // Per-surah custom ranges
  customRanges: {
    [surahId: string]: CustomRange;
  };
}

interface SetCustomRangePayload {
  surahId: string;
  mode: RepetitionMode;
  from: string;
  to: string;
}

interface SetRepeatCountsPayload {
  repeatRange: number;
  repeatEachVerse: number;
  delayMultiplier: number;
}

const initialState: RepeatSettingsState = {
  repeatRange: 2,
  repeatEachVerse: 2,
  delayMultiplier: 1,
  customRanges: {},
};

export const repeatSettingsSlice = createSlice({
  name: SliceName.REPEAT_SETTINGS,
  initialState,
  reducers: {
    setCustomRange: (state, action: PayloadAction<SetCustomRangePayload>) => {
      const { surahId, mode, from, to } = action.payload;

      return {
        ...state,
        customRanges: {
          ...state.customRanges,
          [surahId]: { mode, from, to },
        },
      };
    },

    setRepeatCounts: (state, action: PayloadAction<SetRepeatCountsPayload>) => {
      const { repeatRange, repeatEachVerse, delayMultiplier } = action.payload;

      return {
        ...state,
        repeatRange,
        repeatEachVerse,
        delayMultiplier,
      };
    },

    clearCustomRange: (state, action: PayloadAction<string>) => {
      const surahId = action.payload;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [surahId]: removed, ...rest } = state.customRanges;
      return {
        ...state,
        customRanges: rest,
      };
    },

    clearAllCustomRanges: (state) => {
      return {
        ...state,
        customRanges: {},
      };
    },
  },
});

export const { setCustomRange, setRepeatCounts, clearCustomRange, clearAllCustomRanges } =
  repeatSettingsSlice.actions;

export const selectRepeatSettings = (state: RootState) => state.repeatSettings;

export const selectRepeatCounts = (state: RootState) => ({
  repeatRange: state.repeatSettings.repeatRange,
  repeatEachVerse: state.repeatSettings.repeatEachVerse,
  delayMultiplier: state.repeatSettings.delayMultiplier,
});

export const selectCustomRangeForSurah = (state: RootState, surahId: string) =>
  state.repeatSettings.customRanges[surahId];

export const selectAllCustomRanges = (state: RootState) => state.repeatSettings.customRanges;

export default repeatSettingsSlice.reducer;
