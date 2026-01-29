import React, { useContext, useState } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import styles from './PinnedVersesSection.module.scss';
import usePinnedVerseHandlers from './usePinnedVerseHandlers';

import SaveToCollectionModal, {
  CollectionOption,
} from '@/components/Collection/SaveToCollectionModal/SaveToCollectionModal';
import LoadFromCollectionModal from '@/components/QuranReader/PinnedVerses/LoadFromCollectionModal';
import PinnedVersesContent from '@/components/QuranReader/PinnedVersesBar/PinnedVersesContent';
import DataContext from '@/contexts/DataContext';
import { useToast } from '@/dls/Toast/Toast';
import useCollections from '@/hooks/useCollections';
import usePinnedVerseSync from '@/hooks/usePinnedVerseSync';
import { selectPinnedVerseKeys, selectPinnedVerses } from '@/redux/slices/QuranReader/pinnedVerses';
import { selectStudyModeVerseKey } from '@/redux/slices/QuranReader/studyMode';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { selectSelectedTranslations } from '@/redux/slices/QuranReader/translations';
import { getMushafId } from '@/utils/api';
import { areArraysEqual } from '@/utils/array';
import { isLoggedIn } from '@/utils/auth/login';
import BookmarkType from 'types/BookmarkType';
import ChaptersData from 'types/ChaptersData';

const PinnedVersesSection: React.FC = () => {
  const { t, lang } = useTranslation('quran-reader');
  const router = useRouter();
  const dispatch = useDispatch();
  const toast = useToast();
  const chaptersData = useContext(DataContext) as ChaptersData;

  const pinnedVerses = useSelector(selectPinnedVerses, shallowEqual);
  const pinnedVerseKeys = useSelector(selectPinnedVerseKeys, areArraysEqual) as string[];
  const currentStudyModeVerseKey = useSelector(selectStudyModeVerseKey);
  const selectedTranslations = useSelector(selectSelectedTranslations, areArraysEqual) as number[];
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);

  const mushafId = getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines).mushaf;

  const { collections, addCollection } = useCollections({
    type: BookmarkType.Ayah,
  });

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
    handleCollectionToggled,
    handleNewCollectionCreated,
  } = usePinnedVerseHandlers({
    dispatch,
    pinnedVerses,
    router,
    t,
    toast,
    lang,
    chaptersData,
    selectedTranslations,
    mushafId,
    addCollection,
    setIsSaveModalOpen,
    setIsLoadModalOpen,
    unpinVerseWithSync,
    clearPinnedWithSync,
  });

  const modalCollections: CollectionOption[] = collections.map((collection) => ({
    id: collection.id,
    name: collection.name,
    checked: false,
  }));

  // Always show when there are pinned verses
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
          <SaveToCollectionModal
            isOpen={isSaveModalOpen}
            collections={modalCollections}
            onCollectionToggled={handleCollectionToggled}
            onNewCollectionCreated={handleNewCollectionCreated}
            onClose={() => setIsSaveModalOpen(false)}
            verseKey={pinnedVerseKeys[0] || ''}
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
