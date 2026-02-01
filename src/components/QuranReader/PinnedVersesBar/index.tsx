import React, { useCallback, useContext, useState } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import LoadFromCollectionModal from '../PinnedVerses/LoadFromCollectionModal';
import SavePinnedToCollectionModal from '../PinnedVerses/SavePinnedToCollectionModal';
import copyPinnedVerses from '../PinnedVerses/utils/copyPinnedVerses';

import styles from './PinnedVersesBar.module.scss';
import PinnedVersesContent from './PinnedVersesContent';

import DataContext from '@/contexts/DataContext';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import usePinnedVerseSync from '@/hooks/usePinnedVerseSync';
import {
  selectPinnedVerses,
  selectPinnedVerseKeys,
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
  const selectedTranslations = useSelector(selectSelectedTranslations, areArraysEqual) as number[];

  const { unpinVerseWithSync, clearPinnedWithSync } = usePinnedVerseSync();
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);

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

  const handleRemoveVerse = useCallback(
    (verseKey: string) => {
      logButtonClick('pinned_bar_remove_verse');
      unpinVerseWithSync(verseKey);
    },
    [unpinVerseWithSync],
  );

  const handleClear = useCallback(() => {
    logButtonClick('pinned_bar_clear_all');
    clearPinnedWithSync();
  }, [clearPinnedWithSync]);

  const handleVerseTagClick = useCallback(
    (verseKey: string) => {
      logButtonClick('pinned_bar_verse_tag_click');
      router.push(getChapterWithStartingVerseUrl(verseKey));
    },
    [router],
  );

  const handleSaveToCollection = useCallback(() => {
    logButtonClick('pinned_menu_save_to_collection');
    if (!isLoggedIn()) {
      router.push(getLoginNavigationUrl(router.asPath));
      return;
    }
    setIsSaveModalOpen(true);
  }, [router]);

  if (pinnedVerses.length === 0) return null;

  return (
    <>
      <div className={styles.container}>
        <PinnedVersesContent
          pinnedVerses={pinnedVerses}
          selectedVerseKey={null}
          showCompareButton
          onVerseTagClick={handleVerseTagClick}
          onRemoveVerse={handleRemoveVerse}
          onCompareClick={handleCompareClick}
          onClear={handleClear}
          onSaveToCollection={handleSaveToCollection}
          onLoadFromCollection={handleLoadFromCollection}
          onCopy={handleCopy}
        />
      </div>
      {isLoggedIn() && (
        <SavePinnedToCollectionModal
          isOpen={isSaveModalOpen}
          onClose={() => setIsSaveModalOpen(false)}
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
