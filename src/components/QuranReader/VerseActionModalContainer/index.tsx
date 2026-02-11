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
  VerseActionModalType,
} from '@/redux/slices/QuranReader/verseActionModal';
import { Note } from '@/types/auth/Note';
import { isLoggedIn } from '@/utils/auth/login';
import { logEvent } from '@/utils/eventLogger';
import { consumePendingBookmarkModalRestore } from '@/utils/pendingBookmarkModalRestore';
import { getVerseAndChapterNumbersFromKey } from '@/utils/verse';

const VerseActionModalContainer: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const hasClosedStudyModeRef = useRef(false);

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

  const { data: notesCount } = useBatchedCountRangeNotes(isOpen && verseKey ? verseKey : null);

  useEffect(() => {
    if (!router.isReady) return;
    if (isOpen) return;
    if (!isLoggedIn()) return;

    const pendingRestore = consumePendingBookmarkModalRestore(router.asPath);
    if (!pendingRestore) return;
    const restoreBookmarkModal = async () => {
      try {
        const [chapterId, verseNumber] = getVerseAndChapterNumbersFromKey(pendingRestore.verseKey);
        const response = await getChapterVerses(chapterId, router.locale || 'en', {
          page: verseNumber,
          perPage: 1,
        });
        const restoredVerse = response?.verses?.[0];
        if (!restoredVerse) return;

        dispatch(
          openBookmarkModal({
            verseKey: pendingRestore.verseKey,
            verse: restoredVerse,
          }),
        );
      } catch {
        // Ignore failures and avoid blocking reader interactions.
      }
    };

    restoreBookmarkModal();
  }, [dispatch, isOpen, router.asPath, router.isReady, router.locale]);

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

  if (!isOpen || !verseKey) {
    return null;
  }

  const count = notesCount ?? 0;
  const isNotesModal =
    modalType === VerseActionModalType.ADD_NOTE ||
    modalType === VerseActionModalType.MY_NOTES ||
    modalType === VerseActionModalType.EDIT_NOTE;

  if (isNotesModal) {
    return (
      <NotesModals
        modalType={modalType}
        verseKey={verseKey}
        notesCount={count}
        editingNote={editingNote}
        wasOpenedFromStudyMode={wasOpenedFromStudyMode}
        previousModalType={previousModalType}
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

  if (modalType === VerseActionModalType.TRANSLATION_FEEDBACK) {
    return (
      <FeedbackModal
        verseKey={verseKey}
        wasOpenedFromStudyMode={wasOpenedFromStudyMode}
        onClose={handleFeedbackClose}
        onBack={handleBackToStudyMode}
      />
    );
  }

  if (modalType === VerseActionModalType.SAVE_BOOKMARK && verse) {
    return (
      <BookmarkModal
        verse={verse}
        wasOpenedFromStudyMode={wasOpenedFromStudyMode}
        onClose={handleClose}
        onBack={handleBackToStudyMode}
      />
    );
  }

  if (modalType === VerseActionModalType.ADVANCED_COPY && verse) {
    return (
      <AdvancedCopyModal
        verse={verse}
        wasOpenedFromStudyMode={wasOpenedFromStudyMode}
        onClose={handleAdvancedCopyClose}
        onBack={handleBackToStudyMode}
      />
    );
  }

  if (modalType === VerseActionModalType.READER_BIO && readerBioReader) {
    return (
      <ReaderBioModal
        reader={readerBioReader}
        isOpen={isOpen}
        onClose={handleClose}
        onBack={handleBackToStudyMode}
        wasOpenedFromStudyMode={wasOpenedFromStudyMode}
      />
    );
  }

  return null;
};

export default VerseActionModalContainer;
