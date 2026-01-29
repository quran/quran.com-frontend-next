import { useCallback } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch } from 'react-redux';

import { CollectionOption } from '@/components/Collection/SaveToCollectionModal/SaveToCollectionModal';
import copyPinnedVerses from '@/components/QuranReader/PinnedVerses/utils/copyPinnedVerses';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import {
  PinnedVerse,
  clearPinnedVerses,
  unpinVerse,
} from '@/redux/slices/QuranReader/pinnedVerses';
import { openStudyMode } from '@/redux/slices/QuranReader/studyMode';
import BookmarkType from '@/types/BookmarkType';
import { addBulkCollectionBookmarks } from '@/utils/auth/api';
import { isLoggedIn } from '@/utils/auth/login';
import { logButtonClick } from '@/utils/eventLogger';
import { getLoginNavigationUrl } from '@/utils/navigation';
import ChaptersData from 'types/ChaptersData';
import { Collection } from 'types/Collection';

interface UsePinnedVerseHandlersProps {
  dispatch: ReturnType<typeof useDispatch>;
  pinnedVerses: PinnedVerse[];
  router: ReturnType<typeof useRouter>;
  t: ReturnType<typeof useTranslation>['t'];
  toast: ReturnType<typeof useToast>;
  lang: string;
  chaptersData: ChaptersData;
  selectedTranslations: number[];
  mushafId: number;
  addCollection: (name: string) => Promise<Collection | null>;
  setIsSaveModalOpen: (isOpen: boolean) => void;
  setIsLoadModalOpen: (isOpen: boolean) => void;
}

const usePinnedVerseHandlers = ({
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
}: UsePinnedVerseHandlersProps) => {
  const handleVerseTagClick = useCallback(
    (verseKey: string) => {
      logButtonClick('study_mode_verse_tag_click');
      dispatch(
        openStudyMode({
          verseKey,
          showPinnedSection: true,
        }),
      );
    },
    [dispatch],
  );

  const handleRemoveVerse = useCallback(
    (verseKey: string) => {
      logButtonClick('study_mode_remove_verse');
      dispatch(unpinVerse(verseKey));

      if (pinnedVerses.length > 1) {
        const remainingVerses = pinnedVerses.filter((v) => v.verseKey !== verseKey);
        const nextVerse = remainingVerses[0];
        if (nextVerse) {
          dispatch(
            openStudyMode({
              verseKey: nextVerse.verseKey,
              showPinnedSection: true,
            }),
          );
        }
      }
    },
    [dispatch, pinnedVerses],
  );

  const handleClear = useCallback(() => {
    logButtonClick('study_mode_clear_pinned');
    dispatch(clearPinnedVerses());
  }, [dispatch]);

  const handleSaveToCollection = useCallback(() => {
    logButtonClick('study_mode_save_to_collection');
    if (!isLoggedIn()) {
      router.push(getLoginNavigationUrl(router.asPath));
      return;
    }
    setIsSaveModalOpen(true);
  }, [router, setIsSaveModalOpen]);

  const handleLoadFromCollection = useCallback(() => {
    logButtonClick('study_mode_load_from_collection');
    if (!isLoggedIn()) {
      router.push(getLoginNavigationUrl(router.asPath));
      return;
    }
    setIsLoadModalOpen(true);
  }, [router, setIsLoadModalOpen]);

  const handleCopy = useCallback(async () => {
    logButtonClick('study_mode_copy_pinned');
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

  const handleCollectionToggled = useCallback(
    async (collection: CollectionOption, newValue: boolean) => {
      if (newValue) {
        try {
          const bookmarks = pinnedVerses.map((pv) => ({
            key: pv.chapterNumber,
            type: BookmarkType.Ayah,
            verseNumber: pv.verseNumber,
          }));

          await addBulkCollectionBookmarks({
            collectionId: collection.id,
            bookmarks,
            mushafId,
          });

          toast(t('pinned-saved-successfully'), { status: ToastStatus.Success });
          setIsSaveModalOpen(false);
        } catch {
          toast(t('common:error.general'), { status: ToastStatus.Error });
        }
      }
    },
    [pinnedVerses, mushafId, t, toast, setIsSaveModalOpen],
  );

  const handleNewCollectionCreated = useCallback(
    async (name: string) => {
      const newCollection = await addCollection(name);
      if (newCollection) {
        try {
          const bookmarks = pinnedVerses.map((pv) => ({
            key: pv.chapterNumber,
            type: BookmarkType.Ayah,
            verseNumber: pv.verseNumber,
          }));

          await addBulkCollectionBookmarks({
            collectionId: newCollection.id,
            bookmarks,
            mushafId,
          });

          toast(t('pinned-saved-successfully'), { status: ToastStatus.Success });
        } catch {
          toast(t('common:error.general'), { status: ToastStatus.Error });
        }
      }
      setIsSaveModalOpen(false);
    },
    [addCollection, pinnedVerses, mushafId, t, toast, setIsSaveModalOpen],
  );

  return {
    handleVerseTagClick,
    handleRemoveVerse,
    handleClear,
    handleSaveToCollection,
    handleLoadFromCollection,
    handleCopy,
    handleCollectionToggled,
    handleNewCollectionCreated,
  };
};

export default usePinnedVerseHandlers;
