import React, { useCallback } from 'react';

import dynamic from 'next/dynamic';
import { useDispatch, useSelector } from 'react-redux';

import { clearAllHighlights } from '@/redux/slices/QuranReader/readingViewVerse';
import {
  closeStudyMode,
  selectStudyModeActiveTab,
  selectStudyModeHighlightedWordLocation,
  selectStudyModeIsOpen,
  selectStudyModeVerseKey,
} from '@/redux/slices/QuranReader/studyMode';

const StudyModeModal = dynamic(() => import('./ReadingView/StudyModeModal'), { ssr: false });

/**
 * Global container for the Study Mode modal.
 * This component subscribes to the Redux studyMode state and renders
 * the modal when it's open. It handles closing the modal and resetting
 * highlight state.
 *
 * Mount this component once in the QuranReaderView so the modal is
 * accessible from all entry points.
 *
 * @returns {React.ReactElement | null} The StudyModeModal when open, null otherwise.
 */
const StudyModeContainer: React.FC = () => {
  const dispatch = useDispatch();
  const isOpen = useSelector(selectStudyModeIsOpen);
  const verseKey = useSelector(selectStudyModeVerseKey);
  const activeTab = useSelector(selectStudyModeActiveTab);
  const highlightedWordLocation = useSelector(selectStudyModeHighlightedWordLocation);

  const handleClose = useCallback(() => {
    dispatch(closeStudyMode());
    dispatch(clearAllHighlights());
  }, [dispatch]);

  if (!isOpen || !verseKey) {
    return null;
  }

  return (
    <StudyModeModal
      isOpen={isOpen}
      onClose={handleClose}
      verseKey={verseKey}
      initialActiveTab={activeTab}
      highlightedWordLocation={highlightedWordLocation ?? undefined}
    />
  );
};

export default StudyModeContainer;
