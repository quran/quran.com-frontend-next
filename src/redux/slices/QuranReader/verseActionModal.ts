/* eslint-disable max-lines */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { StudyModeTabId } from '@/components/QuranReader/ReadingView/StudyModeModal/StudyModeBottomActions';
import { RootState } from '@/redux/RootState';
import SliceName from '@/redux/types/SliceName';
import { Note } from '@/types/auth/Note';
import { QiraatReader } from '@/types/Qiraat';
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
  SAVE_BOOKMARK = 'saveBookmark',
  ADVANCED_COPY = 'advancedCopy',
  READER_BIO = 'readerBio',
}

/**
 * State for Study Mode restoration when returning from a modal.
 */
export type StudyModeRestoreState = {
  verseKey: string;
  activeTab: StudyModeTabId | null;
  highlightedWordLocation: string | null;
  isSsrMode?: boolean;
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
  editingNote: Note | null;
  isTranslationView: boolean;
  bookmarksRangeUrl: string;
  wasOpenedFromStudyMode: boolean;
  studyModeRestoreState: StudyModeRestoreState | null;
  readerBioReader: QiraatReader | null;
  previousModalType: VerseActionModalType | null;
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
  readerBioReader: null,
  previousModalType: null,
};

/**
 * Payload for opening a notes modal (Add Note, My Notes).
 */
export type OpenNotesModalPayload = {
  modalType: VerseActionModalType.ADD_NOTE | VerseActionModalType.MY_NOTES;
  verseKey: string;
  wasOpenedFromStudyMode?: boolean;
  studyModeRestoreState?: StudyModeRestoreState;
  previousModalType?: VerseActionModalType | null;
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
 * Payload for opening Bookmark modal.
 */
export type OpenBookmarkModalPayload = {
  verseKey: string;
  verse: Verse;
  isTranslationView?: boolean;
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

/**
 * Payload for opening Reader Bio modal.
 */
export type OpenReaderBioModalPayload = {
  reader: QiraatReader;
  verseKey: string;
  wasOpenedFromStudyMode?: boolean;
  studyModeRestoreState?: StudyModeRestoreState;
};

const verseActionModal = createSlice({
  name: SliceName.VERSE_ACTION_MODAL,
  initialState,
  reducers: {
    openNotesModal: (state, { payload }: PayloadAction<OpenNotesModalPayload>) => ({
      ...state,
      isOpen: true,
      modalType: payload.modalType,
      verseKey: payload.verseKey,
      editingNote: null,
      wasOpenedFromStudyMode: payload.wasOpenedFromStudyMode ?? state.wasOpenedFromStudyMode,
      studyModeRestoreState: payload.studyModeRestoreState ?? state.studyModeRestoreState,
      previousModalType: payload.previousModalType ?? state.modalType,
    }),
    openFeedbackModal: (unusedState, { payload }: PayloadAction<OpenFeedbackModalPayload>) => ({
      ...initialState,
      isOpen: true,
      modalType: VerseActionModalType.TRANSLATION_FEEDBACK,
      verseKey: payload.verseKey,
      verse: payload.verse,
      isTranslationView: payload.isTranslationView ?? false,
      wasOpenedFromStudyMode: payload.wasOpenedFromStudyMode ?? false,
      studyModeRestoreState: payload.studyModeRestoreState ?? null,
    }),
    openCollectionModal: (unusedState, { payload }: PayloadAction<OpenCollectionModalPayload>) => ({
      ...initialState,
      isOpen: true,
      modalType: VerseActionModalType.SAVE_TO_COLLECTION,
      verseKey: payload.verseKey,
      verse: payload.verse,
      isTranslationView: payload.isTranslationView ?? false,
      bookmarksRangeUrl: payload.bookmarksRangeUrl ?? '',
      wasOpenedFromStudyMode: payload.wasOpenedFromStudyMode ?? false,
      studyModeRestoreState: payload.studyModeRestoreState ?? null,
    }),
    openBookmarkModal: (unusedState, { payload }: PayloadAction<OpenBookmarkModalPayload>) => ({
      ...initialState,
      isOpen: true,
      modalType: VerseActionModalType.SAVE_BOOKMARK,
      verseKey: payload.verseKey,
      verse: payload.verse,
      isTranslationView: payload.isTranslationView ?? false,
      wasOpenedFromStudyMode: payload.wasOpenedFromStudyMode ?? false,
      studyModeRestoreState: payload.studyModeRestoreState ?? null,
    }),
    openAdvancedCopyModal: (
      unusedState,
      { payload }: PayloadAction<OpenAdvancedCopyModalPayload>,
    ) => ({
      ...initialState,
      isOpen: true,
      modalType: VerseActionModalType.ADVANCED_COPY,
      verseKey: payload.verseKey,
      verse: payload.verse,
      isTranslationView: payload.isTranslationView ?? false,
      wasOpenedFromStudyMode: payload.wasOpenedFromStudyMode ?? false,
      studyModeRestoreState: payload.studyModeRestoreState ?? null,
    }),
    openReaderBioModal: (unusedState, { payload }: PayloadAction<OpenReaderBioModalPayload>) => ({
      ...initialState,
      isOpen: true,
      modalType: VerseActionModalType.READER_BIO,
      readerBioReader: payload.reader,
      verseKey: payload.verseKey,
      wasOpenedFromStudyMode: payload.wasOpenedFromStudyMode ?? false,
      studyModeRestoreState: payload.studyModeRestoreState ?? null,
    }),
    setModalType: (draft, { payload }: PayloadAction<VerseActionModalType>) => {
      draft.modalType = payload;
    },
    setEditingNote: (draft, { payload }: PayloadAction<Note | null>) => {
      draft.editingNote = payload;
    },
    closeVerseActionModal: () => initialState,
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
export const selectVerseActionModalReaderBioReader = (state: RootState) =>
  state.verseActionModal.readerBioReader;
export const selectVerseActionModalPreviousModalType = (state: RootState) =>
  state.verseActionModal.previousModalType;

export const {
  openNotesModal,
  openFeedbackModal,
  openCollectionModal,
  openBookmarkModal,
  openAdvancedCopyModal,
  openReaderBioModal,
  setModalType,
  setEditingNote,
  closeVerseActionModal,
} = verseActionModal.actions;

export default verseActionModal.reducer;
