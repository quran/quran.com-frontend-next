import React, { useCallback, useContext, useState } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import styles from './PinnedVersesSection.module.scss';
import usePinnedVerseHandlers from './usePinnedVerseHandlers';

import SaveToCollectionModal, {
  CollectionOption,
} from '@/components/Collection/SaveToCollectionModal/SaveToCollectionModal';
import PinnedVersesMenu from '@/components/QuranReader/PinnedVersesBar/PinnedVersesMenu';
import DataContext from '@/contexts/DataContext';
import { useToast } from '@/dls/Toast/Toast';
import useCollections from '@/hooks/useCollections';
import { selectPinnedVerseKeys, selectPinnedVerses } from '@/redux/slices/QuranReader/pinnedVerses';
import {
  selectStudyModeShowPinnedSection,
  selectStudyModeVerseKey,
} from '@/redux/slices/QuranReader/studyMode';
import { selectSelectedTranslations } from '@/redux/slices/QuranReader/translations';
import { areArraysEqual } from '@/utils/array';
import { isLoggedIn } from '@/utils/auth/login';
import { toLocalizedVerseKey } from '@/utils/locale';
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
  const showPinnedSection = useSelector(selectStudyModeShowPinnedSection);

  const { collections, addCollection } = useCollections({
    type: BookmarkType.Ayah,
  });

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

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
    addCollection,
    setIsSaveModalOpen,
  });

  const getVerseDisplayName = useCallback(
    (verseKey: string): string => {
      const localizedKey = toLocalizedVerseKey(verseKey, lang);
      return localizedKey;
    },
    [lang],
  );

  const modalCollections: CollectionOption[] = collections.map((collection) => ({
    id: collection.id,
    name: collection.name,
    checked: false,
  }));

  if (!showPinnedSection || pinnedVerses.length === 0) {
    return null;
  }

  return (
    <>
      <div className={styles.pinnedSection}>
        <div className={styles.pinnedHeader}>
          <p className={styles.pinnedLabel}>{t('pinned-verses')}:</p>
          <div className={styles.headerActions}>
            <PinnedVersesMenu
              onClear={handleClear}
              onSaveToCollection={handleSaveToCollection}
              onLoadFromCollection={handleLoadFromCollection}
              onCopy={handleCopy}
            />
          </div>
        </div>
        <div className={styles.tagsContainer}>
          {pinnedVerses.map((verse) => (
            <button
              key={verse.verseKey}
              type="button"
              className={`${styles.tag} ${
                currentStudyModeVerseKey === verse.verseKey ? styles.tagSelected : ''
              }`}
              onClick={() => handleVerseTagClick(verse.verseKey)}
              aria-label={`View verse ${getVerseDisplayName(verse.verseKey)}`}
            >
              <span className={styles.verseDisplayName}>{getVerseDisplayName(verse.verseKey)}</span>
              <span
                className={styles.removeButton}
                onClick={(e) => handleRemoveVerse(verse.verseKey, e)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleRemoveVerse(verse.verseKey, e as unknown as React.MouseEvent);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`Remove verse ${verse.verseKey} from pinned`}
              >
                ×
              </span>
            </button>
          ))}
        </div>
      </div>

      {isLoggedIn() && (
        <SaveToCollectionModal
          isOpen={isSaveModalOpen}
          collections={modalCollections}
          onCollectionToggled={handleCollectionToggled}
          onNewCollectionCreated={handleNewCollectionCreated}
          onClose={() => setIsSaveModalOpen(false)}
          verseKey={pinnedVerseKeys[0] || ''}
        />
      )}
    </>
  );
};

export default PinnedVersesSection;
