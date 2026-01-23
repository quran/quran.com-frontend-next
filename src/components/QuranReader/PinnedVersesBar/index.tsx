/* eslint-disable max-lines */
import React, { useCallback, useContext, useState } from 'react';

import classNames from 'classnames';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import LoadFromCollectionModal from '../PinnedVerses/LoadFromCollectionModal';
import copyPinnedVerses from '../PinnedVerses/utils/copyPinnedVerses';

import styles from './PinnedVersesBar.module.scss';
import PinnedVersesMenu from './PinnedVersesMenu';
import useSavePinnedToCollection from './useSavePinnedToCollection';
import VerseTag from './VerseTag';

import SaveToCollectionModal from '@/components/Collection/SaveToCollectionModal/SaveToCollectionModal';
import DataContext from '@/contexts/DataContext';
import Button, { ButtonShape, ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import CompareIcon from '@/icons/compare.svg';
import { selectContextMenu } from '@/redux/slices/QuranReader/contextMenu';
import {
  clearPinnedVerses,
  selectPinnedVerses,
  selectPinnedVerseKeys,
  unpinVerse,
} from '@/redux/slices/QuranReader/pinnedVerses';
import { openStudyMode } from '@/redux/slices/QuranReader/studyMode';
import { selectSelectedTranslations } from '@/redux/slices/QuranReader/translations';
import ChaptersData from '@/types/ChaptersData';
import { areArraysEqual } from '@/utils/array';
import { isLoggedIn } from '@/utils/auth/login';
import { logButtonClick } from '@/utils/eventLogger';
import { getChapterWithStartingVerseUrl, getLoginNavigationUrl } from '@/utils/navigation';

const PinnedVersesBar: React.FC = () => {
  const { t, lang } = useTranslation('quran-reader');
  const router = useRouter();
  const dispatch = useDispatch();
  const toast = useToast();
  const chaptersData = useContext(DataContext) as ChaptersData;
  const pinnedVerses = useSelector(selectPinnedVerses, shallowEqual);
  const pinnedVerseKeys = useSelector(selectPinnedVerseKeys, shallowEqual);
  const { isExpanded } = useSelector(selectContextMenu, shallowEqual);
  const selectedTranslations = useSelector(selectSelectedTranslations, areArraysEqual) as number[];

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);

  const closeSaveModal = useCallback(() => setIsSaveModalOpen(false), []);
  const { collections, handleCollectionToggled, handleNewCollectionCreated } =
    useSavePinnedToCollection(closeSaveModal);

  // All useCallback hooks must be before early return to satisfy Rules of Hooks
  const handleCompareClick = useCallback(() => {
    logButtonClick('pinned_bar_compare');
    if (pinnedVerseKeys.length > 0) {
      dispatch(
        openStudyMode({
          verseKey: pinnedVerseKeys[0],
          showPinnedSection: true,
        }),
      );
    }
  }, [dispatch, pinnedVerseKeys]);

  const handleLoadFromCollection = useCallback(() => {
    logButtonClick('pinned_menu_load_from_collection');
    if (!isLoggedIn()) {
      router.push(getLoginNavigationUrl(router.asPath));
      return;
    }
    setIsLoadModalOpen(true);
  }, [router]);

  const handleCopy = useCallback(async () => {
    logButtonClick('pinned_menu_copy');
    try {
      await copyPinnedVerses({
        pinnedVerses,
        lang,
        chaptersData,
        selectedTranslations,
      });
      toast(t('common:copied'), { status: ToastStatus.Success });
    } catch {
      toast(t('common:error.general'), { status: ToastStatus.Error });
    }
  }, [chaptersData, lang, pinnedVerses, selectedTranslations, t, toast]);

  if (pinnedVerses.length === 0) return null;

  const handleRemoveVerse = (verseKey: string) => {
    logButtonClick('pinned_bar_remove_verse');
    dispatch(unpinVerse(verseKey));
  };

  const handleClear = () => {
    logButtonClick('pinned_bar_clear_all');
    dispatch(clearPinnedVerses());
  };

  const handleVerseTagClick = (verseKey: string) => {
    logButtonClick('pinned_bar_verse_tag_click');
    router.push(getChapterWithStartingVerseUrl(verseKey));
  };

  const handleSaveToCollection = () => {
    logButtonClick('pinned_menu_save_to_collection');
    if (!isLoggedIn()) {
      router.push(getLoginNavigationUrl(router.asPath));
      return;
    }
    setIsSaveModalOpen(true);
  };

  return (
    <>
      <div className={classNames(styles.container, { [styles.visibleContainer]: !isExpanded })}>
        <div className={styles.barContent}>
          <div className={styles.labelAndTags}>
            <span className={styles.label}>{t('pinned-verses')}:</span>
            <div className={styles.tagsContainer}>
              {pinnedVerses.map((verse) => (
                <VerseTag
                  key={verse.verseKey}
                  verseKey={verse.verseKey}
                  onRemove={() => handleRemoveVerse(verse.verseKey)}
                  onClick={() => handleVerseTagClick(verse.verseKey)}
                />
              ))}
            </div>
          </div>
          <div className={styles.actions}>
            <Button
              size={ButtonSize.Small}
              variant={ButtonVariant.Ghost}
              shape={ButtonShape.Circle}
              onClick={handleCompareClick}
              tooltip={t('compare-verses')}
              ariaLabel={t('compare-verses')}
            >
              <CompareIcon />
            </Button>
            <PinnedVersesMenu
              onClear={handleClear}
              onSaveToCollection={handleSaveToCollection}
              onLoadFromCollection={handleLoadFromCollection}
              onCopy={handleCopy}
            />
          </div>
        </div>
      </div>
      {isLoggedIn() && (
        <SaveToCollectionModal
          isOpen={isSaveModalOpen}
          collections={collections}
          onCollectionToggled={handleCollectionToggled}
          onNewCollectionCreated={handleNewCollectionCreated}
          onClose={closeSaveModal}
          verseKey={pinnedVerseKeys[0] || ''}
        />
      )}
      {isLoggedIn() && (
        <LoadFromCollectionModal
          isOpen={isLoadModalOpen}
          onClose={() => setIsLoadModalOpen(false)}
        />
      )}
    </>
  );
};

export default PinnedVersesBar;
