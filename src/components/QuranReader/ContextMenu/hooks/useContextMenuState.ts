import { useContext, useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import { useOnboarding } from '@/components/Onboarding/OnboardingProvider';
import useDebounceNavbarVisibility from '@/hooks/useDebounceNavbarVisibility';
import useGetMushaf from '@/hooks/useGetMushaf';
import { selectNavbar } from '@/redux/slices/navbar';
import { selectContextMenu } from '@/redux/slices/QuranReader/contextMenu';
import { selectNotes } from '@/redux/slices/QuranReader/notes';
import { selectLastReadVerseKey } from '@/redux/slices/QuranReader/readingTracker';
import {
  selectIsSidebarNavigationVisible,
  setIsSidebarNavigationVisible,
} from '@/redux/slices/QuranReader/sidebarNavigation';
import { getChapterData, getChapterReadingProgress } from '@/utils/chapter';
import { logEvent } from '@/utils/eventLogger';
import { getJuzNumberByHizb } from '@/utils/juz';
import { toLocalizedNumber } from '@/utils/locale';
import { isMobile } from '@/utils/responsive';
import { getVerseNumberFromKey } from '@/utils/verse';
import DataContext from 'src/contexts/DataContext';
/**
 * Custom hook to manage all state logic for the ContextMenu component
 * @returns {object} An object containing state, data, translations, and event handlers for the ContextMenu
 */
const useContextMenuState = () => {
  const dispatch = useDispatch();
  const chaptersData = useContext(DataContext);
  const isSidebarNavigationVisible = useSelector(selectIsSidebarNavigationVisible);
  const { t, lang } = useTranslation('common');
  const mushaf = useGetMushaf();
  const isSideBarVisible = useSelector(selectNotes, shallowEqual).isVisible;
  const { isExpanded, showReadingPreferenceSwitcher: isReadingPreferenceSwitcherVisible } =
    useSelector(selectContextMenu, shallowEqual);

  const { isActive } = useOnboarding();
  const { isVisible: isNavbarVisible, settingsOpenedFromScrolledState } = useSelector(
    selectNavbar,
    shallowEqual,
  );

  const effectiveNavbarVisibility = settingsOpenedFromScrolledState ? false : isNavbarVisible;

  // Use the shared hook to debounce navbar visibility changes
  const showNavbar = useDebounceNavbarVisibility(effectiveNavbarVisibility, isActive);
  const showReadingPreferenceSwitcher = isReadingPreferenceSwitcherVisible && !isActive;

  const { verseKey, chapterId, page, hizb } = useSelector(selectLastReadVerseKey, shallowEqual);

  // Memoized values
  const chapterData = useMemo(() => {
    return chapterId ? getChapterData(chaptersData, chapterId) : null;
  }, [chapterId, chaptersData]);

  const juzNumber = useMemo(() => {
    return hizb ? toLocalizedNumber(getJuzNumberByHizb(Number(hizb)), lang) : null;
  }, [hizb, lang]);

  const localizedHizb = useMemo(() => {
    return toLocalizedNumber(Number(hizb), lang);
  }, [hizb, lang]);

  // Localized page number
  const localizedPageNumber = useMemo(() => {
    return toLocalizedNumber(Number(page), lang);
  }, [page, lang]);

  // Non-localized page number
  const pageNumber = useMemo(() => {
    return Number(page);
  }, [page]);

  // Progress calculation
  const progress = useMemo(() => {
    if (!verseKey || !chapterData) return 0;
    const verse = getVerseNumberFromKey(verseKey);
    return getChapterReadingProgress(verse, chapterData.versesCount);
  }, [verseKey, chapterData]);

  // Event handlers
  const handleSidebarToggle = (e: React.MouseEvent) => {
    logEvent(`sidebar_navigation_${isSidebarNavigationVisible ? 'close' : 'open'}_trigger`);
    e.stopPropagation();

    if (isSidebarNavigationVisible === 'auto') {
      const shouldBeVisible = isMobile();
      dispatch(setIsSidebarNavigationVisible(shouldBeVisible));
    } else {
      dispatch(setIsSidebarNavigationVisible(!isSidebarNavigationVisible));
    }
  };

  return {
    // State
    isSidebarNavigationVisible,
    showNavbar,
    showReadingPreferenceSwitcher,
    isSideBarVisible,
    isExpanded,
    mushaf,
    verseKey,

    // Data
    chapterData,
    juzNumber,
    localizedHizb,
    localizedPageNumber,
    pageNumber,
    progress,

    // Translations
    t,

    // Event handlers
    handleSidebarToggle,
  };
};

export default useContextMenuState;
