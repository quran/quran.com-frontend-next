import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '@/redux/RootState';
import SliceName from '@/redux/types/SliceName';
import { StudyModeTabId } from '@/components/QuranReader/ReadingView/StudyModeModal/StudyModeBottomActions';

export type StudyModeState = {
  isOpen: boolean;
  verseKey: string | null;
  initialTab: StudyModeTabId | null;
  highlightedWordLocation: string | null;
};

export const initialState: StudyModeState = {
  isOpen: false,
  verseKey: null,
  initialTab: null,
  highlightedWordLocation: null,
};

export type OpenStudyModePayload = {
  verseKey: string;
  initialTab?: StudyModeTabId | null;
  highlightedWordLocation?: string | null;
};

/**
 * This slice manages the global Study Mode modal state.
 * Centralizing this state ensures consistent behavior when opening
 * the modal from different entry points (QuranWord, TranslatedAyah,
 * BottomActions, EndOfSurahSection).
 */
const studyMode = createSlice({
  name: SliceName.STUDY_MODE,
  initialState,
  reducers: {
    openStudyMode: (state, { payload }: PayloadAction<OpenStudyModePayload>) => {
      return {
        isOpen: true,
        verseKey: payload.verseKey,
        initialTab: payload.initialTab ?? null,
        highlightedWordLocation: payload.highlightedWordLocation ?? null,
      };
    },
    closeStudyMode: () => {
      return initialState;
    },
    resetStudyModeState: () => {
      return initialState;
    },
  },
});

// Selectors
export const selectStudyModeIsOpen = (state: RootState) => state.studyMode.isOpen;
export const selectStudyModeVerseKey = (state: RootState) => state.studyMode.verseKey;
export const selectStudyModeInitialTab = (state: RootState) => state.studyMode.initialTab;
export const selectStudyModeHighlightedWordLocation = (state: RootState) =>
  state.studyMode.highlightedWordLocation;

export const { openStudyMode, closeStudyMode, resetStudyModeState } = studyMode.actions;
export default studyMode.reducer;
