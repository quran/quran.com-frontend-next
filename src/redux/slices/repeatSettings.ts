import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '../RootState';

import SliceName from '@/redux/types/SliceName';

export enum RepetitionMode {
  Single = 'single',
  Range = 'range',
  Chapter = 'chapter',
}

export type RepeatSettingsState = {
  chapterId?: string;
  repetitionMode: RepetitionMode;
  repeatRange: number;
  repeatEachVerse: number;
  from: string;
  to: string;
  delayMultiplier: number;
};

const initialState: RepeatSettingsState = {
  chapterId: undefined,
  repetitionMode: RepetitionMode.Single,
  repeatRange: 2,
  repeatEachVerse: 2,
  from: '',
  to: '',
  delayMultiplier: 1,
};

export const repeatSettingsSlice = createSlice({
  name: SliceName.REPEAT_SETTINGS,
  initialState,
  reducers: {
    setRepeatSettings: (
      state: RepeatSettingsState,
      action: PayloadAction<RepeatSettingsState>,
    ) => ({
      ...state,
      ...action.payload,
    }),
    updateRepeatSettings: (
      state: RepeatSettingsState,
      action: PayloadAction<Partial<RepeatSettingsState>>,
    ) => ({
      ...state,
      ...action.payload,
    }),
    resetRepeatSettings: (
      state: RepeatSettingsState,
      action: PayloadAction<{
        chapterId: string;
        firstVerseKey: string;
        lastVerseKey: string;
        repetitionMode?: RepetitionMode;
      }>,
    ) => ({
      ...initialState,
      chapterId: action.payload.chapterId,
      from: action.payload.firstVerseKey,
      to: action.payload.lastVerseKey,
      repetitionMode: action.payload.repetitionMode ?? RepetitionMode.Single,
    }),
  },
});

export const { setRepeatSettings, updateRepeatSettings, resetRepeatSettings } =
  repeatSettingsSlice.actions;

export const selectRepeatSettings = (state: RootState) => state.repeatSettings;

export default repeatSettingsSlice.reducer;
