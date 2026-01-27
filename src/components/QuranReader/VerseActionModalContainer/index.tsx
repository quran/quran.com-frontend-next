/* eslint-disable max-lines */
import React, { useCallback, useEffect, useRef } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import AdvancedCopyModal from './AdvancedCopyModal';
import CollectionModal from './CollectionModal';
import FeedbackModal from './FeedbackModal';
import NotesModals from './NotesModals';
import useCollectionHandlers from './useCollectionHandlers';

import useBatchedCountRangeNotes from '@/hooks/auth/useBatchedCountRangeNotes';
import {
  closeStudyMode,
  openStudyMode,
  selectStudyModeIsOpen,
} from '@/redux/slices/QuranReader/studyMode';
import {
  closeVerseActionModal,
  selectVerseActionModalBookmarksRangeUrl,
  selectVerseActionModalEditingNote,
  selectVerseActionModalIsOpen,
  selectVerseActionModalIsTranslationView,
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
import { logEvent } from '@/utils/eventLogger';

const VerseActionModalContainer: React.FC = () => {
  const dispatch = useDispatch();
  const hasClosedStudyModeRef = useRef(false);

  const isOpen = useSelector(selectVerseActionModalIsOpen);
  const modalType = useSelector(selectVerseActionModalType);
  const verseKey = useSelector(selectVerseActionModalVerseKey);
  const verse = useSelector(selectVerseActionModalVerse);
  const editingNote = useSelector(selectVerseActionModalEditingNote);
  const isTranslationView = useSelector(selectVerseActionModalIsTranslationView);
  const bookmarksRangeUrl = useSelector(selectVerseActionModalBookmarksRangeUrl);
  const wasOpenedFromStudyMode = useSelector(selectVerseActionModalWasOpenedFromStudyMode);
  const studyModeRestoreState = useSelector(selectVerseActionModalStudyModeRestoreState);
  const isStudyModeOpen = useSelector(selectStudyModeIsOpen);

  const chapterId = verse ? Number(verse.chapterId) : 0;
  const verseNumber = verse?.verseNumber ?? 0;

  const { data: notesCount } = useBatchedCountRangeNotes(isOpen && verseKey ? verseKey : null);

  const { modalCollections, onCollectionToggled, onNewCollectionCreated } = useCollectionHandlers({
    chapterId,
    verseNumber,
    bookmarksRangeUrl,
  });

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
        modalType={modalType as string}
        verseKey={verseKey}
        notesCount={count}
        editingNote={editingNote}
        wasOpenedFromStudyMode={wasOpenedFromStudyMode}
        onClose={handleClose}
        onBack={handleBackToStudyMode}
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

  if (modalType === VerseActionModalType.SAVE_TO_COLLECTION) {
    return (
      <CollectionModal
        verseKey={verseKey}
        collections={modalCollections}
        wasOpenedFromStudyMode={wasOpenedFromStudyMode}
        onClose={handleClose}
        onBack={handleBackToStudyMode}
        onCollectionToggled={onCollectionToggled}
        onNewCollectionCreated={onNewCollectionCreated}
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

  return null;
};

export default VerseActionModalContainer;
