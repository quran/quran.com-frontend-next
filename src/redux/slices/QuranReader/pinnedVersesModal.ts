import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { StudyModeTabId } from '@/components/QuranReader/ReadingView/StudyModeModal/StudyModeBottomActions';
import { RootState } from '@/redux/RootState';
import SliceName from '@/redux/types/SliceName';

export enum PinnedVersesModalType {
  SAVE_TO_COLLECTION = 'saveToCollection',
  LOAD_FROM_COLLECTION = 'loadFromCollection',
  ADD_NOTE = 'addNote',
}

export type PinnedVersesStudyModeRestoreState = {
  verseKey: string;
  activeTab: StudyModeTabId | null;
  highlightedWordLocation: string | null;
  isSsrMode?: boolean;
  showPinnedSection?: boolean;
};

export type PinnedVersesModalState = {
  isOpen: boolean;
  modalType: PinnedVersesModalType | null;
  wasOpenedFromStudyMode: boolean;
  studyModeRestoreState: PinnedVersesStudyModeRestoreState | null;
};

export const initialState: PinnedVersesModalState = {
  isOpen: false,
  modalType: null,
  wasOpenedFromStudyMode: false,
  studyModeRestoreState: null,
};

export type OpenPinnedVersesModalPayload = {
  modalType: PinnedVersesModalType;
  wasOpenedFromStudyMode?: boolean;
  studyModeRestoreState?: PinnedVersesStudyModeRestoreState;
};

const pinnedVersesModal = createSlice({
  name: SliceName.PINNED_VERSES_MODAL,
  initialState,
  reducers: {
    openPinnedVersesModal: (state, { payload }: PayloadAction<OpenPinnedVersesModalPayload>) => ({
      ...initialState,
      isOpen: true,
      modalType: payload.modalType,
      wasOpenedFromStudyMode: payload.wasOpenedFromStudyMode ?? false,
      studyModeRestoreState: payload.studyModeRestoreState ?? null,
    }),
    closePinnedVersesModal: () => initialState,
  },
});

export const selectPinnedVersesModalIsOpen = (state: RootState) => state.pinnedVersesModal.isOpen;
export const selectPinnedVersesModalType = (state: RootState) => state.pinnedVersesModal.modalType;
export const selectPinnedVersesModalWasOpenedFromStudyMode = (state: RootState) =>
  state.pinnedVersesModal.wasOpenedFromStudyMode;
export const selectPinnedVersesModalStudyModeRestoreState = (state: RootState) =>
  state.pinnedVersesModal.studyModeRestoreState;

export const { openPinnedVersesModal, closePinnedVersesModal } = pinnedVersesModal.actions;

export default pinnedVersesModal.reducer;
