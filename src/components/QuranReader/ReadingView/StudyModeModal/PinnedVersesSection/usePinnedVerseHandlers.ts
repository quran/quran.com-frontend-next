import { useCallback } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch } from 'react-redux';

import copyPinnedVerses from '@/components/QuranReader/PinnedVerses/utils/copyPinnedVerses';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import { PinnedVerse } from '@/redux/slices/QuranReader/pinnedVerses';
import { openStudyMode } from '@/redux/slices/QuranReader/studyMode';
import { isLoggedIn } from '@/utils/auth/login';
import { logButtonClick } from '@/utils/eventLogger';
import { getLoginNavigationUrl } from '@/utils/navigation';
import ChaptersData from 'types/ChaptersData';

interface UsePinnedVerseHandlersProps {
  dispatch: ReturnType<typeof useDispatch>;
  pinnedVerses: PinnedVerse[];
  router: ReturnType<typeof useRouter>;
  t: ReturnType<typeof useTranslation>['t'];
  toast: ReturnType<typeof useToast>;
  lang: string;
  chaptersData: ChaptersData;
  selectedTranslations: number[];
  setIsSaveModalOpen: (isOpen: boolean) => void;
  setIsLoadModalOpen: (isOpen: boolean) => void;
  unpinVerseWithSync: (verseKey: string) => Promise<void>;
  clearPinnedWithSync: () => Promise<void>;
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
  setIsSaveModalOpen,
  setIsLoadModalOpen,
  unpinVerseWithSync,
  clearPinnedWithSync,
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
      unpinVerseWithSync(verseKey);

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
    [dispatch, pinnedVerses, unpinVerseWithSync],
  );

  const handleClear = useCallback(() => {
    logButtonClick('study_mode_clear_pinned');
    clearPinnedWithSync();
  }, [clearPinnedWithSync]);

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

  return {
    handleVerseTagClick,
    handleRemoveVerse,
    handleClear,
    handleSaveToCollection,
    handleLoadFromCollection,
    handleCopy,
  };
};

export default usePinnedVerseHandlers;
