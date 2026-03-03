import React, { useCallback, useContext, useMemo } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import styles from './PinnedVersesSection.module.scss';
import usePinnedVerseHandlers from './usePinnedVerseHandlers';

import PinnedVersesContent from '@/components/QuranReader/PinnedVersesBar/PinnedVersesContent';
import DataContext from '@/contexts/DataContext';
import { useToast } from '@/dls/Toast/Toast';
import usePinnedVerseSync from '@/hooks/usePinnedVerseSync';
import { selectPinnedVerses } from '@/redux/slices/QuranReader/pinnedVerses';
import {
  openPinnedVersesModal,
  PinnedVersesModalType,
} from '@/redux/slices/QuranReader/pinnedVersesModal';
import {
  selectStudyModeActiveTab,
  selectStudyModeHighlightedWordLocation,
  selectStudyModeIsSsrMode,
  selectStudyModeShowPinnedSection,
  selectStudyModeVerseKey,
} from '@/redux/slices/QuranReader/studyMode';
import { selectSelectedTranslations } from '@/redux/slices/QuranReader/translations';
import { areArraysEqual } from '@/utils/array';
import ChaptersData from 'types/ChaptersData';

interface PinnedVersesSectionProps {
  onGoToVerse: (chapterId: string, verseNumber: string) => void;
}

const PinnedVersesSection: React.FC<PinnedVersesSectionProps> = ({ onGoToVerse }) => {
  const { t, lang } = useTranslation('quran-reader');
  const router = useRouter();
  const dispatch = useDispatch();
  const toast = useToast();
  const chaptersData = useContext(DataContext) as ChaptersData;

  const pinnedVerses = useSelector(selectPinnedVerses, shallowEqual);
  const currentStudyModeVerseKey = useSelector(selectStudyModeVerseKey);
  const studyModeActiveTab = useSelector(selectStudyModeActiveTab);
  const studyModeHighlightedWordLocation = useSelector(selectStudyModeHighlightedWordLocation);
  const studyModeIsSsrMode = useSelector(selectStudyModeIsSsrMode);
  const studyModeShowPinnedSection = useSelector(selectStudyModeShowPinnedSection);
  const selectedTranslations = useSelector(selectSelectedTranslations, areArraysEqual) as number[];

  const { unpinVerseWithSync, clearPinnedWithSync } = usePinnedVerseSync();

  const studyModeRestoreState = useMemo(() => {
    if (!currentStudyModeVerseKey) return null;
    return {
      verseKey: currentStudyModeVerseKey,
      activeTab: studyModeActiveTab,
      highlightedWordLocation: studyModeHighlightedWordLocation,
      isSsrMode: studyModeIsSsrMode,
      showPinnedSection: studyModeShowPinnedSection,
    };
  }, [
    currentStudyModeVerseKey,
    studyModeActiveTab,
    studyModeHighlightedWordLocation,
    studyModeIsSsrMode,
    studyModeShowPinnedSection,
  ]);

  const openPinnedModal = useCallback(
    (modalType: PinnedVersesModalType) => {
      dispatch(
        openPinnedVersesModal({
          modalType,
          wasOpenedFromStudyMode: Boolean(studyModeRestoreState),
          studyModeRestoreState: studyModeRestoreState ?? undefined,
        }),
      );
    },
    [dispatch, studyModeRestoreState],
  );

  const {
    handleVerseTagClick,
    handleRemoveVerse,
    handleClear,
    handleSaveToCollection,
    handleLoadFromCollection,
    handleAddNote,
    handleCopy,
  } = usePinnedVerseHandlers({
    pinnedVerses,
    router,
    t,
    toast,
    lang,
    chaptersData,
    selectedTranslations,
    openPinnedModal,
    unpinVerseWithSync,
    clearPinnedWithSync,
    onGoToVerse,
  });

  if (pinnedVerses.length === 0) {
    return null;
  }

  return (
    <>
      <div className={styles.pinnedSection}>
        <PinnedVersesContent
          pinnedVerses={pinnedVerses}
          selectedVerseKey={currentStudyModeVerseKey}
          showCompareButton={false}
          noPadding
          onVerseTagClick={handleVerseTagClick}
          onRemoveVerse={handleRemoveVerse}
          onClear={handleClear}
          onSaveToCollection={handleSaveToCollection}
          onLoadFromCollection={handleLoadFromCollection}
          onCopy={handleCopy}
          onAddNote={handleAddNote}
        />
      </div>
    </>
  );
};

export default PinnedVersesSection;
