import React, { useCallback, useEffect, useRef } from 'react';

import dynamic from 'next/dynamic';
import { useDispatch, useSelector } from 'react-redux';

import type { StudyModeTabId } from '@/components/QuranReader/ReadingView/StudyModeModal/StudyModeBottomActions';
import { clearAllHighlights } from '@/redux/slices/QuranReader/readingViewVerse';
import {
  closeStudyMode,
  selectStudyModeActiveTab,
  selectStudyModeHighlightedWordLocation,
  selectStudyModeIsOpen,
  selectStudyModeIsSsrMode,
  selectStudyModeVerseKey,
} from '@/redux/slices/QuranReader/studyMode';

const StudyModeModal = dynamic(() => import('./ReadingView/StudyModeModal'), { ssr: false });

type LastOpenState = {
  verseKey: string | null;
  activeTab: StudyModeTabId | null;
  highlightedWordLocation: string | null;
};

/**
 * Global container for the Study Mode modal.
 * This component subscribes to the Redux studyMode state and keeps
 * the modal mounted to allow close animations. It handles closing the modal and resetting
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
  const isSsrMode = useSelector(selectStudyModeIsSsrMode);
  const verseKey = useSelector(selectStudyModeVerseKey);
  const activeTab = useSelector(selectStudyModeActiveTab);
  const highlightedWordLocation = useSelector(selectStudyModeHighlightedWordLocation);
  const lastOpenStateRef = useRef<LastOpenState>({
    verseKey: null,
    activeTab: null,
    highlightedWordLocation: null,
  });

  const handleClose = useCallback(() => {
    dispatch(closeStudyMode());
    dispatch(clearAllHighlights());
  }, [dispatch]);

  useEffect(() => {
    if (isOpen && verseKey) {
      lastOpenStateRef.current = {
        verseKey,
        activeTab,
        highlightedWordLocation,
      };
    }
  }, [isOpen, verseKey, activeTab, highlightedWordLocation]);

  // Don't render the client-side modal when in SSR mode (SSR container handles it)
  if (isSsrMode) return null;

  const {
    verseKey: lastVerseKey,
    activeTab: lastActiveTab,
    highlightedWordLocation: lastHighlight,
  } = lastOpenStateRef.current;

  const effectiveVerseKey = isOpen ? verseKey : lastVerseKey;
  const effectiveActiveTab = isOpen ? activeTab : lastActiveTab;
  const effectiveHighlightedWordLocation = isOpen ? highlightedWordLocation : lastHighlight;

  if (!effectiveVerseKey) return null;

  return (
    <StudyModeModal
      isOpen={isOpen}
      onClose={handleClose}
      verseKey={effectiveVerseKey}
      initialActiveTab={effectiveActiveTab ?? undefined}
      highlightedWordLocation={effectiveHighlightedWordLocation ?? undefined}
    />
  );
};

export default StudyModeContainer;
