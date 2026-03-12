/* eslint-disable max-lines */
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
  showPinnedSection: boolean;
  isLessonsChapterBannerVisible: boolean;
  isReflectionsChapterBannerVisible: boolean;
};

export const initialState: StudyModeState = {
  isOpen: false,
  isSsrMode: false,
  verseKey: null,
  activeTab: null,
  highlightedWordLocation: null,
  previousState: null,
  showPinnedSection: false,
  isLessonsChapterBannerVisible: true,
  isReflectionsChapterBannerVisible: true,
};

export type OpenStudyModePayload = {
  verseKey: string;
  activeTab?: StudyModeTabId | null;
  highlightedWordLocation?: string | null;
  showPinnedSection?: boolean;
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
        showPinnedSection: payload.showPinnedSection ?? false,
        isLessonsChapterBannerVisible: state.isLessonsChapterBannerVisible,
        isReflectionsChapterBannerVisible: state.isReflectionsChapterBannerVisible,
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
        showPinnedSection: payload.showPinnedSection ?? false,
        isLessonsChapterBannerVisible: state.isLessonsChapterBannerVisible,
        isReflectionsChapterBannerVisible: state.isReflectionsChapterBannerVisible,
      };
    },
    closeStudyMode: (state) => {
      return {
        ...initialState,
        isLessonsChapterBannerVisible: state.isLessonsChapterBannerVisible,
        isReflectionsChapterBannerVisible: state.isReflectionsChapterBannerVisible,
      };
    },
    resetStudyModeState: (state) => {
      return {
        ...initialState,
        isLessonsChapterBannerVisible: state.isLessonsChapterBannerVisible,
        isReflectionsChapterBannerVisible: state.isReflectionsChapterBannerVisible,
      };
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
        return {
          ...initialState,
          isLessonsChapterBannerVisible: state.isLessonsChapterBannerVisible,
          isReflectionsChapterBannerVisible: state.isReflectionsChapterBannerVisible,
        };
      }
      return {
        ...initialState,
        previousState: {
          verseKey: state.verseKey,
          activeTab: state.activeTab,
          highlightedWordLocation: state.highlightedWordLocation,
        },
        isLessonsChapterBannerVisible: state.isLessonsChapterBannerVisible,
        isReflectionsChapterBannerVisible: state.isReflectionsChapterBannerVisible,
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
        showPinnedSection: state.showPinnedSection,
        isLessonsChapterBannerVisible: state.isLessonsChapterBannerVisible,
        isReflectionsChapterBannerVisible: state.isReflectionsChapterBannerVisible,
      };
    },
    clearPreviousState: (state) => {
      return {
        ...state,
        previousState: null,
      };
    },
    setIsLessonsChapterBannerVisible: (state, { payload }: PayloadAction<boolean>) => {
      return { ...state, isLessonsChapterBannerVisible: payload };
    },
    setIsReflectionsChapterBannerVisible: (state, { payload }: PayloadAction<boolean>) => {
      return { ...state, isReflectionsChapterBannerVisible: payload };
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
export const selectStudyModeShowPinnedSection = (state: RootState) =>
  state.studyMode.showPinnedSection;
export const selectIsLessonsChapterBannerVisible = (state: RootState) =>
  state.studyMode.isLessonsChapterBannerVisible ?? true;
export const selectIsReflectionsChapterBannerVisible = (state: RootState) =>
  state.studyMode.isReflectionsChapterBannerVisible ?? true;

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
  setIsLessonsChapterBannerVisible,
  setIsReflectionsChapterBannerVisible,
} = studyMode.actions;
export default studyMode.reducer;
