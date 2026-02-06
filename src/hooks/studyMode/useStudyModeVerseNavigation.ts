import { useState, useCallback, useContext } from 'react';

import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';

import { StudyModeTabId } from '@/components/QuranReader/ReadingView/StudyModeModal/StudyModeBottomActions';
import DataContext from '@/contexts/DataContext';
import { setVerseKey } from '@/redux/slices/QuranReader/studyMode';
import { fakeNavigateReplace } from '@/utils/navigation';

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

  const safeChapterId = initialChapterId || '1';
  const safeVerseNumber = initialVerseNumber || '1';

  const [selectedChapterId, setSelectedChapterId] = useState(safeChapterId);
  const [selectedVerseNumber, setSelectedVerseNumber] = useState(safeVerseNumber);

  const verseKey = `${selectedChapterId}:${selectedVerseNumber}`;

  const handleChapterChange = useCallback(
    (newChapterId: string) => {
      setSelectedChapterId(newChapterId);
      setSelectedVerseNumber('1');
      dispatch(setVerseKey(`${newChapterId}:1`));
      const url = getNavigationUrlForTab(newChapterId, '1', activeContentTab);
      if (url) {
        fakeNavigateReplace(url, router.locale || 'en');
      }
    },
    [dispatch, activeContentTab, getNavigationUrlForTab, router.locale],
  );

  const handleVerseChange = useCallback(
    (newVerseNumber: string) => {
      setSelectedVerseNumber(newVerseNumber);
      dispatch(setVerseKey(`${selectedChapterId}:${newVerseNumber}`));
      const url = getNavigationUrlForTab(selectedChapterId, newVerseNumber, activeContentTab);
      if (url) {
        fakeNavigateReplace(url, router.locale || 'en');
      }
    },
    [dispatch, selectedChapterId, activeContentTab, getNavigationUrlForTab, router.locale],
  );

  const handlePreviousVerse = useCallback(() => {
    const currentVerseNum = Number(selectedVerseNumber);
    const newVerseNumber = String(currentVerseNum - 1);
    setSelectedVerseNumber(newVerseNumber);
    dispatch(setVerseKey(`${selectedChapterId}:${newVerseNumber}`));
    const url = getNavigationUrlForTab(selectedChapterId, newVerseNumber, activeContentTab);
    if (url) {
      fakeNavigateReplace(url, router.locale || 'en');
    }
  }, [
    selectedVerseNumber,
    selectedChapterId,
    dispatch,
    activeContentTab,
    getNavigationUrlForTab,
    router.locale,
  ]);

  const handleNextVerse = useCallback(() => {
    const currentVerseNum = Number(selectedVerseNumber);
    const newVerseNumber = String(currentVerseNum + 1);
    setSelectedVerseNumber(newVerseNumber);
    dispatch(setVerseKey(`${selectedChapterId}:${newVerseNumber}`));
    const url = getNavigationUrlForTab(selectedChapterId, newVerseNumber, activeContentTab);
    if (url) {
      fakeNavigateReplace(url, router.locale || 'en');
    }
  }, [
    selectedVerseNumber,
    selectedChapterId,
    dispatch,
    activeContentTab,
    getNavigationUrlForTab,
    router.locale,
  ]);

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
  };
};

export default useStudyModeVerseNavigation;
