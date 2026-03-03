import React, { useCallback, useEffect, useRef } from 'react';

import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import AddNoteModal from '@/components/Notes/modal/AddNoteModal';
import LoadFromCollectionModal from '@/components/QuranReader/PinnedVerses/LoadFromCollectionModal';
import SavePinnedToCollectionModal from '@/components/QuranReader/PinnedVerses/SavePinnedToCollectionModal';
import { selectPinnedVerseKeys } from '@/redux/slices/QuranReader/pinnedVerses';
import {
  closePinnedVersesModal,
  PinnedVersesModalType,
  selectPinnedVersesModalIsOpen,
  selectPinnedVersesModalStudyModeRestoreState,
  selectPinnedVersesModalType,
  selectPinnedVersesModalWasOpenedFromStudyMode,
} from '@/redux/slices/QuranReader/pinnedVersesModal';
import {
  closeStudyMode,
  openStudyMode,
  selectStudyModeIsOpen,
} from '@/redux/slices/QuranReader/studyMode';

const PinnedVersesModalContainer: React.FC = () => {
  const dispatch = useDispatch();
  const hasClosedStudyModeRef = useRef(false);

  const isOpen = useSelector(selectPinnedVersesModalIsOpen);
  const modalType = useSelector(selectPinnedVersesModalType);
  const wasOpenedFromStudyMode = useSelector(selectPinnedVersesModalWasOpenedFromStudyMode);
  const studyModeRestoreState = useSelector(selectPinnedVersesModalStudyModeRestoreState);
  const isStudyModeOpen = useSelector(selectStudyModeIsOpen);
  const pinnedVerseKeys = useSelector(selectPinnedVerseKeys, shallowEqual);

  useEffect(() => {
    if (isOpen && wasOpenedFromStudyMode && !hasClosedStudyModeRef.current) {
      hasClosedStudyModeRef.current = true;
      if (!studyModeRestoreState?.isSsrMode && isStudyModeOpen) {
        dispatch(closeStudyMode());
      }
    }
  }, [dispatch, isOpen, isStudyModeOpen, studyModeRestoreState, wasOpenedFromStudyMode]);

  useEffect(() => {
    if (!isOpen) {
      hasClosedStudyModeRef.current = false;
    }
  }, [isOpen]);

  const handleBackToStudyMode = useCallback(() => {
    dispatch(closePinnedVersesModal());

    if (studyModeRestoreState?.isSsrMode) {
      return;
    }

    if (studyModeRestoreState) {
      dispatch(
        openStudyMode({
          verseKey: studyModeRestoreState.verseKey,
          activeTab: studyModeRestoreState.activeTab,
          highlightedWordLocation: studyModeRestoreState.highlightedWordLocation,
          showPinnedSection: studyModeRestoreState.showPinnedSection,
        }),
      );
    }
  }, [dispatch, studyModeRestoreState]);

  const handleClose = useCallback(() => {
    if (wasOpenedFromStudyMode) {
      handleBackToStudyMode();
    } else {
      dispatch(closePinnedVersesModal());
    }
  }, [dispatch, handleBackToStudyMode, wasOpenedFromStudyMode]);

  if (!isOpen || !modalType) {
    return null;
  }

  const shouldShowBack = wasOpenedFromStudyMode;

  if (modalType === PinnedVersesModalType.SAVE_TO_COLLECTION) {
    return (
      <SavePinnedToCollectionModal
        isOpen={isOpen}
        onClose={handleClose}
        onBack={shouldShowBack ? handleBackToStudyMode : undefined}
      />
    );
  }

  if (modalType === PinnedVersesModalType.LOAD_FROM_COLLECTION) {
    return (
      <LoadFromCollectionModal
        isOpen={isOpen}
        onClose={handleClose}
        onBack={shouldShowBack ? handleBackToStudyMode : undefined}
      />
    );
  }

  if (modalType === PinnedVersesModalType.ADD_NOTE) {
    return (
      <AddNoteModal
        showRanges
        isModalOpen={isOpen}
        onModalClose={handleClose}
        onMyNotes={handleClose}
        onBack={shouldShowBack ? handleBackToStudyMode : undefined}
        verseKeys={pinnedVerseKeys}
      />
    );
  }

  return null;
};

export default PinnedVersesModalContainer;
