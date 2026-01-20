import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { StudyModeTabId } from '@/components/QuranReader/ReadingView/StudyModeModal/StudyModeBottomActions';
import { RootState } from '@/redux/RootState';
import SliceName from '@/redux/types/SliceName';
import { Note } from '@/types/auth/Note';
import Verse from '@/types/Verse';

/**
 * Modal types for verse actions opened from Study Mode or reading views.
 */
export enum VerseActionModalType {
  ADD_NOTE = 'addNote',
  MY_NOTES = 'myNotes',
  EDIT_NOTE = 'editNote',
  TRANSLATION_FEEDBACK = 'translationFeedback',
  SAVE_TO_COLLECTION = 'saveToCollection',
  ADVANCED_COPY = 'advancedCopy',
}

/**
 * State for Study Mode restoration when returning from a modal.
 */
export type StudyModeRestoreState = {
  verseKey: string;
  activeTab: StudyModeTabId | null;
  highlightedWordLocation: string | null;
};

/**
 * State for the verse action modal system.
 * This unified state manages all modals that can be opened from verse actions
 * (Notes, Translation Feedback, Save to Collection).
 */
export type VerseActionModalState = {
  isOpen: boolean;
  modalType: VerseActionModalType | null;
  verseKey: string | null;
  verse: Verse | null;
  // Notes-specific
  editingNote: Note | null;
  // Translation/Collection-specific
  isTranslationView: boolean;
  bookmarksRangeUrl: string;
  // Study Mode restoration
  wasOpenedFromStudyMode: boolean;
  studyModeRestoreState: StudyModeRestoreState | null;
};

export const initialState: VerseActionModalState = {
  isOpen: false,
  modalType: null,
  verseKey: null,
  verse: null,
  editingNote: null,
  isTranslationView: false,
  bookmarksRangeUrl: '',
  wasOpenedFromStudyMode: false,
  studyModeRestoreState: null,
};

/**
 * Payload for opening a notes modal (Add Note, My Notes).
 */
export type OpenNotesModalPayload = {
  modalType: VerseActionModalType.ADD_NOTE | VerseActionModalType.MY_NOTES;
  verseKey: string;
  wasOpenedFromStudyMode?: boolean;
  studyModeRestoreState?: StudyModeRestoreState;
};

/**
 * Payload for opening Translation Feedback modal.
 */
export type OpenFeedbackModalPayload = {
  verseKey: string;
  verse: Verse;
  isTranslationView?: boolean;
  wasOpenedFromStudyMode?: boolean;
  studyModeRestoreState?: StudyModeRestoreState;
};

/**
 * Payload for opening Save to Collection modal.
 */
export type OpenCollectionModalPayload = {
  verseKey: string;
  verse: Verse;
  isTranslationView?: boolean;
  bookmarksRangeUrl?: string;
  wasOpenedFromStudyMode?: boolean;
  studyModeRestoreState?: StudyModeRestoreState;
};

/**
 * Payload for opening Advanced Copy modal.
 */
export type OpenAdvancedCopyModalPayload = {
  verseKey: string;
  verse: Verse;
  isTranslationView?: boolean;
  wasOpenedFromStudyMode?: boolean;
  studyModeRestoreState?: StudyModeRestoreState;
};

const verseActionModal = createSlice({
  name: SliceName.VERSE_ACTION_MODAL,
  initialState,
  reducers: {
    /**
     * Opens the Add Note or My Notes modal.
     */
    openNotesModal: (state, { payload }: PayloadAction<OpenNotesModalPayload>) => {
      return {
        ...initialState,
        isOpen: true,
        modalType: payload.modalType,
        verseKey: payload.verseKey,
        wasOpenedFromStudyMode: payload.wasOpenedFromStudyMode ?? false,
        studyModeRestoreState: payload.studyModeRestoreState ?? null,
      };
    },

    /**
     * Opens the Translation Feedback modal.
     */
    openFeedbackModal: (state, { payload }: PayloadAction<OpenFeedbackModalPayload>) => {
      return {
        ...initialState,
        isOpen: true,
        modalType: VerseActionModalType.TRANSLATION_FEEDBACK,
        verseKey: payload.verseKey,
        verse: payload.verse,
        isTranslationView: payload.isTranslationView ?? false,
        wasOpenedFromStudyMode: payload.wasOpenedFromStudyMode ?? false,
        studyModeRestoreState: payload.studyModeRestoreState ?? null,
      };
    },

    /**
     * Opens the Save to Collection modal.
     */
    openCollectionModal: (state, { payload }: PayloadAction<OpenCollectionModalPayload>) => {
      return {
        ...initialState,
        isOpen: true,
        modalType: VerseActionModalType.SAVE_TO_COLLECTION,
        verseKey: payload.verseKey,
        verse: payload.verse,
        isTranslationView: payload.isTranslationView ?? false,
        bookmarksRangeUrl: payload.bookmarksRangeUrl ?? '',
        wasOpenedFromStudyMode: payload.wasOpenedFromStudyMode ?? false,
        studyModeRestoreState: payload.studyModeRestoreState ?? null,
      };
    },

    /**
     * Opens the Advanced Copy modal.
     */
    openAdvancedCopyModal: (state, { payload }: PayloadAction<OpenAdvancedCopyModalPayload>) => {
      return {
        ...initialState,
        isOpen: true,
        modalType: VerseActionModalType.ADVANCED_COPY,
        verseKey: payload.verseKey,
        verse: payload.verse,
        isTranslationView: payload.isTranslationView ?? false,
        wasOpenedFromStudyMode: payload.wasOpenedFromStudyMode ?? false,
        studyModeRestoreState: payload.studyModeRestoreState ?? null,
      };
    },

    /**
     * Changes the current modal type (e.g., from Add Note to My Notes).
     */
    setModalType: (state, { payload }: PayloadAction<VerseActionModalType>) => {
      state.modalType = payload;
    },

    /**
     * Sets the note being edited.
     */
    setEditingNote: (state, { payload }: PayloadAction<Note | null>) => {
      state.editingNote = payload;
    },

    /**
     * Closes the modal and resets state.
     */
    closeVerseActionModal: () => {
      return initialState;
    },
  },
});

// Selectors
export const selectVerseActionModalIsOpen = (state: RootState) => state.verseActionModal.isOpen;
export const selectVerseActionModalType = (state: RootState) => state.verseActionModal.modalType;
export const selectVerseActionModalVerseKey = (state: RootState) => state.verseActionModal.verseKey;
export const selectVerseActionModalVerse = (state: RootState) => state.verseActionModal.verse;
export const selectVerseActionModalEditingNote = (state: RootState) =>
  state.verseActionModal.editingNote;
export const selectVerseActionModalIsTranslationView = (state: RootState) =>
  state.verseActionModal.isTranslationView;
export const selectVerseActionModalBookmarksRangeUrl = (state: RootState) =>
  state.verseActionModal.bookmarksRangeUrl;
export const selectVerseActionModalWasOpenedFromStudyMode = (state: RootState) =>
  state.verseActionModal.wasOpenedFromStudyMode;
export const selectVerseActionModalStudyModeRestoreState = (state: RootState) =>
  state.verseActionModal.studyModeRestoreState;

export const {
  openNotesModal,
  openFeedbackModal,
  openCollectionModal,
  openAdvancedCopyModal,
  setModalType,
  setEditingNote,
  closeVerseActionModal,
} = verseActionModal.actions;

export default verseActionModal.reducer;
