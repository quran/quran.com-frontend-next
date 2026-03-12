import React, { useCallback, useEffect } from 'react';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';

import { StudyModeTabId } from '@/components/QuranReader/ReadingView/StudyModeModal/StudyModeBottomActions';
import { clearAllHighlights } from '@/redux/slices/QuranReader/readingViewVerse';
import {
  closeStudyMode,
  openStudyMode,
  selectStudyModeActiveTab,
  selectStudyModeHighlightedWordLocation,
  selectStudyModeIsOpen,
  selectStudyModeIsSsrMode,
  selectStudyModeVerseKey,
} from '@/redux/slices/QuranReader/studyMode';

const STUDY_MODE_VERSE_KEY_QUERY_PARAM = 'studyModeVerseKey';
const STUDY_MODE_TAB_QUERY_PARAM = 'studyModeTab';

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
 * Also handles restoring study mode from URL query parameters (e.g. after
 * returning from a login redirect triggered by the EbookBanner CTA).
 *
 * @returns {React.ReactElement | null} The StudyModeModal when open, null otherwise.
 */
const StudyModeContainer: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const isOpen = useSelector(selectStudyModeIsOpen);
  const isSsrMode = useSelector(selectStudyModeIsSsrMode);
  const verseKey = useSelector(selectStudyModeVerseKey);
  const activeTab = useSelector(selectStudyModeActiveTab);
  const highlightedWordLocation = useSelector(selectStudyModeHighlightedWordLocation);

  // Restore study mode from URL query params (e.g. after EbookBanner login redirect)
  useEffect(() => {
    if (!router.isReady) return;
    const verseKeyParam = router.query[STUDY_MODE_VERSE_KEY_QUERY_PARAM] as string | undefined;
    const tabParam = router.query[STUDY_MODE_TAB_QUERY_PARAM] as string | undefined;

    if (verseKeyParam) {
      dispatch(
        openStudyMode({
          verseKey: verseKeyParam,
          activeTab: (tabParam as StudyModeTabId) ?? null,
        }),
      );
    }
  }, [router.isReady, router.query, dispatch]);

  const handleClose = useCallback(() => {
    dispatch(closeStudyMode());
    dispatch(clearAllHighlights());
  }, [dispatch]);

  // Don't render the client-side modal when in SSR mode (SSR container handles it)
  if (!isOpen || !verseKey || isSsrMode) {
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
