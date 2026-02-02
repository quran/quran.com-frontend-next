import React, { useContext, useState } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useSelector } from 'react-redux';

import styles from './PinnedVersesSection.module.scss';
import usePinnedVerseHandlers from './usePinnedVerseHandlers';

import LoadFromCollectionModal from '@/components/QuranReader/PinnedVerses/LoadFromCollectionModal';
import SavePinnedToCollectionModal from '@/components/QuranReader/PinnedVerses/SavePinnedToCollectionModal';
import PinnedVersesContent from '@/components/QuranReader/PinnedVersesBar/PinnedVersesContent';
import DataContext from '@/contexts/DataContext';
import { useToast } from '@/dls/Toast/Toast';
import usePinnedVerseSync from '@/hooks/usePinnedVerseSync';
import { selectPinnedVerses } from '@/redux/slices/QuranReader/pinnedVerses';
import { selectStudyModeVerseKey } from '@/redux/slices/QuranReader/studyMode';
import { selectSelectedTranslations } from '@/redux/slices/QuranReader/translations';
import { areArraysEqual } from '@/utils/array';
import { isLoggedIn } from '@/utils/auth/login';
import ChaptersData from 'types/ChaptersData';

interface PinnedVersesSectionProps {
  onGoToVerse: (chapterId: string, verseNumber: string) => void;
}

const PinnedVersesSection: React.FC<PinnedVersesSectionProps> = ({ onGoToVerse }) => {
  const { t, lang } = useTranslation('quran-reader');
  const router = useRouter();
  const toast = useToast();
  const chaptersData = useContext(DataContext) as ChaptersData;

  const pinnedVerses = useSelector(selectPinnedVerses, shallowEqual);
  const currentStudyModeVerseKey = useSelector(selectStudyModeVerseKey);
  const selectedTranslations = useSelector(selectSelectedTranslations, areArraysEqual) as number[];

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
  const { unpinVerseWithSync, clearPinnedWithSync } = usePinnedVerseSync();

  const {
    handleVerseTagClick,
    handleRemoveVerse,
    handleClear,
    handleSaveToCollection,
    handleLoadFromCollection,
    handleCopy,
  } = usePinnedVerseHandlers({
    pinnedVerses,
    router,
    t,
    toast,
    lang,
    chaptersData,
    selectedTranslations,
    setIsSaveModalOpen,
    setIsLoadModalOpen,
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
        />
      </div>

      {isLoggedIn() && (
        <>
          <SavePinnedToCollectionModal
            isOpen={isSaveModalOpen}
            onClose={() => setIsSaveModalOpen(false)}
          />
          <LoadFromCollectionModal
            isOpen={isLoadModalOpen}
            onClose={() => setIsLoadModalOpen(false)}
          />
        </>
      )}
    </>
  );
};

export default PinnedVersesSection;
