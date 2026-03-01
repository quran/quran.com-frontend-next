/* eslint-disable max-lines */
import React, { useCallback, useEffect, useRef } from 'react';

import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';

import AdvancedCopyModal from './AdvancedCopyModal';
import BookmarkModal from './BookmarkModal';
import FeedbackModal from './FeedbackModal';
import NotesModals from './NotesModals';
import ReaderBioModal from './ReaderBioModal';

import { getChapterVerses } from '@/api';
import useBatchedCountRangeNotes from '@/hooks/auth/useBatchedCountRangeNotes';
import useIsLoggedIn from '@/hooks/auth/useIsLoggedIn';
import {
  closeStudyMode,
  openStudyMode,
  selectStudyModeIsOpen,
} from '@/redux/slices/QuranReader/studyMode';
import {
  closeVerseActionModal,
  openBookmarkModal,
  selectVerseActionModalEditingNote,
  selectVerseActionModalIsOpen,
  selectVerseActionModalIsTranslationView,
  selectVerseActionModalReaderBioReader,
  selectVerseActionModalPreviousModalType,
  selectVerseActionModalStudyModeRestoreState,
  selectVerseActionModalType,
  selectVerseActionModalVerse,
  selectVerseActionModalVerseKey,
  selectVerseActionModalWasOpenedFromStudyMode,
  setEditingNote,
  setModalType,
  type StudyModeRestoreState,
  VerseActionModalType,
} from '@/redux/slices/QuranReader/verseActionModal';
import type { Note } from '@/types/auth/Note';
import Language from '@/types/Language';
import type { QiraatReader } from '@/types/Qiraat';
import type Verse from '@/types/Verse';
import { logEvent } from '@/utils/eventLogger';
import {
  consumePendingBookmarkModalRestore,
  getPendingBookmarkModalRestore,
} from '@/utils/pendingBookmarkModalRestore';
import { getVerseAndChapterNumbersFromKey } from '@/utils/verse';

type LastOpenState = {
  modalType: VerseActionModalType | null;
  verseKey: string | null;
  verse: Verse | null;
  editingNote: Note | null;
  isTranslationView: boolean;
  wasOpenedFromStudyMode: boolean;
  studyModeRestoreState: StudyModeRestoreState | null;
  readerBioReader: QiraatReader | null;
  previousModalType: VerseActionModalType | null;
};

const VerseActionModalContainer: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const hasClosedStudyModeRef = useRef(false);
  const { isLoggedIn: isUserLoggedIn } = useIsLoggedIn();

  const isOpen = useSelector(selectVerseActionModalIsOpen);
  const modalType = useSelector(selectVerseActionModalType);
  const verseKey = useSelector(selectVerseActionModalVerseKey);
  const verse = useSelector(selectVerseActionModalVerse);
  const editingNote = useSelector(selectVerseActionModalEditingNote);
  const isTranslationView = useSelector(selectVerseActionModalIsTranslationView);
  const wasOpenedFromStudyMode = useSelector(selectVerseActionModalWasOpenedFromStudyMode);
  const studyModeRestoreState = useSelector(selectVerseActionModalStudyModeRestoreState);
  const readerBioReader = useSelector(selectVerseActionModalReaderBioReader);
  const previousModalType = useSelector(selectVerseActionModalPreviousModalType);
  const isStudyModeOpen = useSelector(selectStudyModeIsOpen);

  const lastOpenStateRef = useRef<LastOpenState>({
    modalType: null,
    verseKey: null,
    verse: null,
    editingNote: null,
    isTranslationView: false,
    wasOpenedFromStudyMode: false,
    studyModeRestoreState: null,
    readerBioReader: null,
    previousModalType: null,
  });

  const { data: notesCount } = useBatchedCountRangeNotes(isOpen && verseKey ? verseKey : null);

  const getRestoredVerse = useCallback(
    async (pendingVerseKey: string) => {
      try {
        const [chapterId, verseNumber] = getVerseAndChapterNumbersFromKey(pendingVerseKey);
        const response = await getChapterVerses(chapterId, router.locale || Language.EN, {
          page: verseNumber,
          perPage: 1,
        });
        return response?.verses?.[0] || null;
      } catch {
        return null;
      }
    },
    [router.locale],
  );

  useEffect(() => {
    let isCancelled = false;
    const cancelRestore = () => {
      isCancelled = true;
    };

    if (!router.isReady || isOpen || !isUserLoggedIn) {
      return cancelRestore;
    }

    const restorePath = router.asPath;
    const pendingRestore = getPendingBookmarkModalRestore(restorePath);
    if (!pendingRestore) {
      return cancelRestore;
    }

    const restoreBookmarkModal = async () => {
      const restoredVerse = await getRestoredVerse(pendingRestore.verseKey);
      if (!restoredVerse || isCancelled) return;
      if (router.asPath !== restorePath) return;
      const consumedRestore = consumePendingBookmarkModalRestore(restorePath);
      if (!consumedRestore) return;
      if (consumedRestore.verseKey !== pendingRestore.verseKey) return;

      dispatch(
        openBookmarkModal({
          verseKey: consumedRestore.verseKey,
          verse: restoredVerse,
        }),
      );
    };

    restoreBookmarkModal();
    return cancelRestore;
  }, [dispatch, getRestoredVerse, isOpen, isUserLoggedIn, router.asPath, router.isReady]);

  useEffect(() => {
    if (isOpen && wasOpenedFromStudyMode && !hasClosedStudyModeRef.current) {
      hasClosedStudyModeRef.current = true;
      // For SSR mode, the modal hides itself via Redux state (no action needed)
      // For regular mode, close the study mode modal
      if (!studyModeRestoreState?.isSsrMode && isStudyModeOpen) {
        dispatch(closeStudyMode());
      }
    }
  }, [isOpen, wasOpenedFromStudyMode, isStudyModeOpen, studyModeRestoreState, dispatch]);

  useEffect(() => {
    if (!isOpen) {
      hasClosedStudyModeRef.current = false;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !verseKey || !modalType) {
      return;
    }

    lastOpenStateRef.current = {
      modalType,
      verseKey,
      verse,
      editingNote,
      isTranslationView,
      wasOpenedFromStudyMode,
      studyModeRestoreState,
      readerBioReader,
      previousModalType,
    };
  }, [
    isOpen,
    modalType,
    verseKey,
    verse,
    editingNote,
    isTranslationView,
    wasOpenedFromStudyMode,
    studyModeRestoreState,
    readerBioReader,
    previousModalType,
  ]);

  const handleBackToStudyMode = useCallback(() => {
    dispatch(closeVerseActionModal());

    // For SSR mode, the modal auto-shows when verse action closes (via Redux state)
    if (studyModeRestoreState?.isSsrMode) {
      return;
    }

    // For regular mode, re-open study mode with saved state
    if (studyModeRestoreState) {
      dispatch(
        openStudyMode({
          verseKey: studyModeRestoreState.verseKey,
          activeTab: studyModeRestoreState.activeTab,
          highlightedWordLocation: studyModeRestoreState.highlightedWordLocation,
        }),
      );
    } else if (verseKey) {
      dispatch(openStudyMode({ verseKey }));
    }
  }, [dispatch, studyModeRestoreState, verseKey]);

  const handleBackToBookmark = useCallback(() => {
    if (!verse) return;
    dispatch(setModalType(VerseActionModalType.SAVE_BOOKMARK));
  }, [dispatch, verse]);

  const handleClose = useCallback(() => {
    if (wasOpenedFromStudyMode) {
      handleBackToStudyMode();
    } else {
      dispatch(closeVerseActionModal());
    }
  }, [dispatch, wasOpenedFromStudyMode, handleBackToStudyMode]);

  const handleFeedbackClose = useCallback(() => {
    const view = isTranslationView ? 'translation_view' : 'reading_view';
    logEvent(`${view}_translation_feedback_modal_close`);
    handleClose();
  }, [isTranslationView, handleClose]);

  const handleAdvancedCopyClose = useCallback(() => {
    const view = isTranslationView ? 'translation_view' : 'reading_view';
    logEvent(`${view}_advanced_copy_modal_close`);
    handleClose();
  }, [isTranslationView, handleClose]);

  const effectiveState: LastOpenState = isOpen
    ? {
        modalType,
        verseKey,
        verse,
        editingNote,
        isTranslationView,
        wasOpenedFromStudyMode,
        studyModeRestoreState,
        readerBioReader,
        previousModalType,
      }
    : lastOpenStateRef.current;

  if (!effectiveState.verseKey || !effectiveState.modalType) return null;

  const isNotesModal =
    effectiveState.modalType === VerseActionModalType.ADD_NOTE ||
    effectiveState.modalType === VerseActionModalType.MY_NOTES ||
    effectiveState.modalType === VerseActionModalType.EDIT_NOTE;

  if (isNotesModal) {
    return (
      <NotesModals
        isOpen={isOpen}
        modalType={effectiveState.modalType}
        verseKey={effectiveState.verseKey}
        notesCount={notesCount}
        editingNote={effectiveState.editingNote}
        wasOpenedFromStudyMode={effectiveState.wasOpenedFromStudyMode}
        previousModalType={effectiveState.previousModalType}
        onClose={handleClose}
        onBack={handleBackToStudyMode}
        onBackToBookmark={handleBackToBookmark}
        onOpenMyNotes={() => dispatch(setModalType(VerseActionModalType.MY_NOTES))}
        onOpenAddNote={() => dispatch(setModalType(VerseActionModalType.ADD_NOTE))}
        onOpenEditNote={(note: Note) => {
          dispatch(setEditingNote(note));
          dispatch(setModalType(VerseActionModalType.EDIT_NOTE));
        }}
      />
    );
  }

  if (effectiveState.modalType === VerseActionModalType.TRANSLATION_FEEDBACK) {
    return (
      <FeedbackModal
        isOpen={isOpen}
        verseKey={effectiveState.verseKey}
        wasOpenedFromStudyMode={effectiveState.wasOpenedFromStudyMode}
        onClose={handleFeedbackClose}
        onBack={handleBackToStudyMode}
      />
    );
  }

  if (effectiveState.modalType === VerseActionModalType.SAVE_BOOKMARK && effectiveState.verse) {
    return (
      <BookmarkModal
        isOpen={isOpen}
        verse={effectiveState.verse}
        wasOpenedFromStudyMode={effectiveState.wasOpenedFromStudyMode}
        onClose={handleClose}
        onBack={handleBackToStudyMode}
      />
    );
  }

  if (effectiveState.modalType === VerseActionModalType.ADVANCED_COPY && effectiveState.verse) {
    return (
      <AdvancedCopyModal
        isOpen={isOpen}
        verse={effectiveState.verse}
        wasOpenedFromStudyMode={effectiveState.wasOpenedFromStudyMode}
        onClose={handleAdvancedCopyClose}
        onBack={handleBackToStudyMode}
      />
    );
  }

  if (
    effectiveState.modalType === VerseActionModalType.READER_BIO &&
    effectiveState.readerBioReader
  ) {
    return (
      <ReaderBioModal
        reader={effectiveState.readerBioReader}
        isOpen={isOpen}
        onClose={handleClose}
        onBack={handleBackToStudyMode}
        wasOpenedFromStudyMode={effectiveState.wasOpenedFromStudyMode}
      />
    );
  }

  return null;
};

export default VerseActionModalContainer;
