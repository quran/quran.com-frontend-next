import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { StudyModeTabId } from '@/components/QuranReader/ReadingView/StudyModeModal/StudyModeBottomActions';
import { RootState } from '@/redux/RootState';
import SliceName from '@/redux/types/SliceName';

export type PreviousStudyModeState = {
  verseKey: string;
  activeTab: StudyModeTabId | null;
  highlightedWordLocation: string | null;
};

export type StudyModeState = {
  isOpen: boolean;
  isSsrMode: boolean;
  verseKey: string | null;
  activeTab: StudyModeTabId | null;
  highlightedWordLocation: string | null;
  previousState: PreviousStudyModeState | null;
};

export const initialState: StudyModeState = {
  isOpen: false,
  isSsrMode: false,
  verseKey: null,
  activeTab: null,
  highlightedWordLocation: null,
  previousState: null,
};

export type OpenStudyModePayload = {
  verseKey: string;
  activeTab?: StudyModeTabId | null;
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
        isSsrMode: false,
        verseKey: payload.verseKey,
        activeTab: payload.activeTab ?? null,
        highlightedWordLocation: payload.highlightedWordLocation ?? null,
        previousState: state.previousState,
      };
    },
    openStudyModeSsr: (state, { payload }: PayloadAction<OpenStudyModePayload>) => {
      return {
        isOpen: true,
        isSsrMode: true,
        verseKey: payload.verseKey,
        activeTab: payload.activeTab ?? null,
        highlightedWordLocation: payload.highlightedWordLocation ?? null,
        previousState: state.previousState,
      };
    },
    closeStudyMode: () => {
      return initialState;
    },
    resetStudyModeState: () => {
      return initialState;
    },
    setActiveTab: (state, { payload }: PayloadAction<StudyModeTabId | null>) => {
      return { ...state, activeTab: payload };
    },
    setVerseKey: (state, { payload }: PayloadAction<string>) => {
      return { ...state, verseKey: payload };
    },
    setHighlightedWordLocation: (state, { payload }: PayloadAction<string | null>) => {
      return { ...state, highlightedWordLocation: payload };
    },
    saveAndCloseStudyMode: (state) => {
      if (!state.verseKey) {
        return initialState;
      }
      return {
        ...initialState,
        previousState: {
          verseKey: state.verseKey,
          activeTab: state.activeTab,
          highlightedWordLocation: state.highlightedWordLocation,
        },
      };
    },
    restoreStudyMode: (state) => {
      if (!state.previousState) {
        return state;
      }
      return {
        isOpen: true,
        isSsrMode: false,
        verseKey: state.previousState.verseKey,
        activeTab: state.previousState.activeTab,
        highlightedWordLocation: state.previousState.highlightedWordLocation,
        previousState: null,
      };
    },
    clearPreviousState: (state) => {
      return {
        ...state,
        previousState: null,
      };
    },
  },
});

// Selectors
export const selectStudyModeIsOpen = (state: RootState) => state.studyMode.isOpen;
export const selectStudyModeIsSsrMode = (state: RootState) => state.studyMode.isSsrMode;
export const selectStudyModeVerseKey = (state: RootState) => state.studyMode.verseKey;
export const selectStudyModeActiveTab = (state: RootState) => state.studyMode.activeTab;
export const selectStudyModeHighlightedWordLocation = (state: RootState) =>
  state.studyMode.highlightedWordLocation;
export const selectStudyModePreviousState = (state: RootState) => state.studyMode.previousState;

export const {
  openStudyMode,
  openStudyModeSsr,
  closeStudyMode,
  resetStudyModeState,
  setActiveTab,
  setVerseKey,
  setHighlightedWordLocation,
  saveAndCloseStudyMode,
  restoreStudyMode,
  clearPreviousState,
} = studyMode.actions;
export default studyMode.reducer;
