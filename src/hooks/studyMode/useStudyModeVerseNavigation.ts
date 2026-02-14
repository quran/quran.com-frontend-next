import { useState, useCallback, useContext, useMemo } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch } from 'react-redux';

import { StudyModeTabId } from '@/components/QuranReader/ReadingView/StudyModeModal/StudyModeBottomActions';
import DataContext from '@/contexts/DataContext';
import { setVerseKey } from '@/redux/slices/QuranReader/studyMode';
import { isRTLLocale, toLocalizedVerseKey, toLocalizedVerseKeyRTL } from '@/utils/locale';
import { fakeNavigateReplace } from '@/utils/navigation';
import { getChapterNumberFromKey } from '@/utils/verse';

interface UseStudyModeVerseNavigationProps {
  initialChapterId: string;
  initialVerseNumber: string;
  activeContentTab: StudyModeTabId | null;
  getNavigationUrlForTab: (
    chapterId: string,
    verseNumber: string,
    tab: StudyModeTabId | null,
  ) => string | null;
}

interface UseStudyModeVerseNavigationReturn {
  selectedChapterId: string;
  selectedVerseNumber: string;
  verseKey: string;
  canNavigatePrev: boolean;
  canNavigateNext: boolean;
  handleChapterChange: (chapterId: string) => void;
  handleVerseChange: (verseNumber: string) => void;
  handlePreviousVerse: () => void;
  handleNextVerse: () => void;
  handleGoBack: () => void;
  handleGoToVerse: (chapterId: string, verseNumber: string, shouldAddToHistory?: boolean) => void;
  verseHistory?: {
    chapterName: string;
    localizedVerseKey: string;
  } | null;
}

const useStudyModeVerseNavigation = ({
  initialChapterId,
  initialVerseNumber,
  activeContentTab,
  getNavigationUrlForTab,
}: UseStudyModeVerseNavigationProps): UseStudyModeVerseNavigationReturn => {
  const router = useRouter();
  const dispatch = useDispatch();
  const chaptersData = useContext(DataContext);
  const { lang } = useTranslation();

  const safeChapterId = initialChapterId || '1';
  const safeVerseNumber = initialVerseNumber || '1';

  const [selectedChapterId, setSelectedChapterId] = useState(safeChapterId);
  const [selectedVerseNumber, setSelectedVerseNumber] = useState(safeVerseNumber);
  const [versesHistory, setVersesHistory] = useState<string[]>([]);
  const verseKey = `${selectedChapterId}:${selectedVerseNumber}`;

  const navigateToVerse = useCallback(
    (newChapterId: string, newVerseNumber: string, shouldAddToHistory = true) => {
      // Add current verse to history before navigating
      if (shouldAddToHistory) {
        setVersesHistory((prev) => [...prev, verseKey]);
      }

      setSelectedChapterId(newChapterId);
      setSelectedVerseNumber(newVerseNumber);
      dispatch(setVerseKey(`${newChapterId}:${newVerseNumber}`));
      const url = getNavigationUrlForTab(newChapterId, newVerseNumber, activeContentTab);
      if (url) {
        fakeNavigateReplace(url, router.locale || 'en');
      }
    },
    [dispatch, activeContentTab, getNavigationUrlForTab, router.locale, verseKey],
  );

  const handleChapterChange = useCallback(
    (newChapterId: string) => {
      navigateToVerse(newChapterId, '1');
    },
    [navigateToVerse],
  );

  const handleVerseChange = useCallback(
    (newVerseNumber: string) => {
      navigateToVerse(selectedChapterId, newVerseNumber);
    },
    [navigateToVerse, selectedChapterId],
  );

  const handlePreviousVerse = useCallback(() => {
    const currentVerseNum = Number(selectedVerseNumber);
    const newVerseNumber = String(currentVerseNum - 1);
    navigateToVerse(selectedChapterId, newVerseNumber, false);
  }, [selectedVerseNumber, navigateToVerse, selectedChapterId]);

  const handleNextVerse = useCallback(() => {
    const currentVerseNum = Number(selectedVerseNumber);
    const newVerseNumber = String(currentVerseNum + 1);
    navigateToVerse(selectedChapterId, newVerseNumber, false);
  }, [selectedVerseNumber, navigateToVerse, selectedChapterId]);

  const handleGoBack = useCallback(() => {
    if (versesHistory.length === 0) return;

    const previousVerseKey = versesHistory[versesHistory.length - 1];
    setVersesHistory((prev) => prev.slice(0, -1));

    const [prevChapterId, prevVerseNumber] = previousVerseKey.split(':');

    // Don't add to history when going back
    navigateToVerse(prevChapterId, prevVerseNumber, false);
  }, [versesHistory, navigateToVerse]);

  const verseHistory = useMemo(() => {
    if (versesHistory.length === 0) return null;
    const prevVerseKey = versesHistory[versesHistory.length - 1];
    const chapter = chaptersData?.[getChapterNumberFromKey(prevVerseKey)];
    const localizedVerseKey = isRTLLocale(lang)
      ? toLocalizedVerseKeyRTL(prevVerseKey, lang)
      : toLocalizedVerseKey(prevVerseKey, lang);
    return {
      localizedVerseKey,
      chapterName: chapter?.transliteratedName || '',
    };
  }, [versesHistory, chaptersData, lang]);

  const canNavigatePrev = Number(selectedVerseNumber) > 1;
  const currentChapter = chaptersData?.[Number(selectedChapterId)];
  const canNavigateNext = currentChapter
    ? Number(selectedVerseNumber) < currentChapter.versesCount
    : false;

  return {
    selectedChapterId,
    selectedVerseNumber,
    verseKey,
    canNavigatePrev,
    canNavigateNext,
    handleChapterChange,
    handleVerseChange,
    handlePreviousVerse,
    handleNextVerse,
    handleGoBack,
    handleGoToVerse: navigateToVerse,
    verseHistory,
  };
};

export default useStudyModeVerseNavigation;
