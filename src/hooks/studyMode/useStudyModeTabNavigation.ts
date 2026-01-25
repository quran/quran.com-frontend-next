import { useState, useCallback } from 'react';

import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';

import { StudyModeTabId } from '@/components/QuranReader/ReadingView/StudyModeModal/StudyModeBottomActions';
import { setActiveTab } from '@/redux/slices/QuranReader/studyMode';
import { selectSelectedTafsirs } from '@/redux/slices/QuranReader/tafsirs';
import {
  fakeNavigateReplace,
  getVerseSelectedTafsirNavigationUrl,
  getVerseReflectionNavigationUrl,
  getVerseLessonNavigationUrl,
  getVerseAnswersNavigationUrl,
} from '@/utils/navigation';

interface UseStudyModeTabNavigationProps {
  initialTab: StudyModeTabId;
  tafsirIdOrSlug?: string;
}

interface UseStudyModeTabNavigationReturn {
  activeContentTab: StudyModeTabId | null;
  handleTabChange: (tabId: StudyModeTabId | null, chapterId: string, verseNumber: string) => void;
  getNavigationUrlForTab: (
    chapterId: string,
    verseNumber: string,
    tab: StudyModeTabId | null,
  ) => string | null;
}

const useStudyModeTabNavigation = ({
  initialTab,
  tafsirIdOrSlug,
}: UseStudyModeTabNavigationProps): UseStudyModeTabNavigationReturn => {
  const router = useRouter();
  const dispatch = useDispatch();
  const tafsirs = useSelector(selectSelectedTafsirs);

  const [activeContentTab, setActiveContentTab] = useState<StudyModeTabId | null>(initialTab);

  const getNavigationUrlForTab = useCallback(
    (chId: string, vNum: string, tab: StudyModeTabId | null) => {
      const vk = `${chId}:${vNum}`;
      if (tab === StudyModeTabId.TAFSIR) {
        const tafsirSlug = tafsirIdOrSlug || (tafsirs.length > 0 ? tafsirs[0] : null);
        if (tafsirSlug) {
          return getVerseSelectedTafsirNavigationUrl(chId, Number(vNum), tafsirSlug);
        }
        return getVerseSelectedTafsirNavigationUrl(chId, Number(vNum), 'en-tafisr-ibn-kathir');
      }
      if (tab === StudyModeTabId.REFLECTIONS) {
        return getVerseReflectionNavigationUrl(vk);
      }
      if (tab === StudyModeTabId.LESSONS) {
        return getVerseLessonNavigationUrl(vk);
      }
      if (tab === StudyModeTabId.ANSWERS) {
        return getVerseAnswersNavigationUrl(vk);
      }
      return null;
    },
    [tafsirIdOrSlug, tafsirs],
  );

  const handleTabChange = useCallback(
    (tabId: StudyModeTabId | null, chapterId: string, verseNumber: string) => {
      setActiveContentTab(tabId);
      dispatch(setActiveTab(tabId));

      const url = getNavigationUrlForTab(chapterId, verseNumber, tabId);
      if (url) {
        fakeNavigateReplace(url, router.locale || 'en');
      }
    },
    [dispatch, getNavigationUrlForTab, router.locale],
  );

  return {
    activeContentTab,
    handleTabChange,
    getNavigationUrlForTab,
  };
};

export default useStudyModeTabNavigation;
