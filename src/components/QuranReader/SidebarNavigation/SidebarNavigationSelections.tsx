import React, { useContext } from 'react';

import dynamic from 'next/dynamic';
import { useDispatch, useSelector } from 'react-redux';

import SidebarSelectionSkeleton from './SidebarSelectionSkeleton';

import {
  selectLastReadVerseKey,
  setLastReadVerse,
} from '@/redux/slices/QuranReader/readingTracker';
import {
  IsSidebarNavigationVisible,
  NavigationItem,
  setIsSidebarNavigationVisible,
} from '@/redux/slices/QuranReader/sidebarNavigation';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import NavigationItemType from '@/types/NavigationItemType';
import getFirstPageNumberForChapter from '@/utils/chapter-pages';
import { formatStringNumber } from '@/utils/number';
import { isMobile } from '@/utils/responsive';
import DataContext from 'src/contexts/DataContext';

const PageSelection = dynamic(() => import('./PageSelection'), {
  loading: SidebarSelectionSkeleton,
});
const SurahSelection = dynamic(() => import('./SurahSelection'), {
  loading: SidebarSelectionSkeleton,
});
const JuzSelection = dynamic(() => import('./JuzSelection'), {
  loading: SidebarSelectionSkeleton,
});
const VerseSelection = dynamic(() => import('./VerseSelection'), {
  loading: SidebarSelectionSkeleton,
});

type Props = {
  isVisible: IsSidebarNavigationVisible;
  selectedNavigationItem: string;
};

const SidebarNavigationSelections: React.FC<Props> = ({ isVisible, selectedNavigationItem }) => {
  const dispatch = useDispatch();
  const lastReadVerseKey = useSelector(selectLastReadVerseKey);
  const chaptersData = useContext(DataContext);
  const quranReaderStyles = useSelector(selectQuranReaderStyles);
  // we skip requesting any selection list if the drawer is not open.
  if (!isVisible) return <></>;

  // Handle mobile sidebar closing after navigation
  // Mobile sidebar is closed directly in onAfterNavigationItemRouted

  // Update Redux state when a page is selected
  const updateReduxStateWithPage = (pageNumber: string) => {
    dispatch(
      setLastReadVerse({
        lastReadVerse: {
          ...lastReadVerseKey,
          page: pageNumber,
        },
        chaptersData,
      }),
    );
  };

  const updateReduxStateWithChapter = async (chapterId: string) => {
    // First get the page number for this chapter
    try {
      const formattedChapterId = formatStringNumber(chapterId);
      // Use the new utility function that respects the current Mushaf
      const firstPageNumber = await getFirstPageNumberForChapter(
        formattedChapterId,
        quranReaderStyles.quranFont,
        quranReaderStyles.mushafLines,
      );

      // Update Redux with both chapter and page information
      dispatch(
        setLastReadVerse({
          lastReadVerse: {
            ...lastReadVerseKey,
            verseKey: `${chapterId}:1`,
            chapterId,
            page: firstPageNumber || lastReadVerseKey.page, // Use the first page or keep existing
          },
          chaptersData,
        }),
      );
    } catch (error) {
      // If we can't get the page number, just update the chapter
      dispatch(
        setLastReadVerse({
          lastReadVerse: {
            ...lastReadVerseKey,
            verseKey: `${chapterId}:1`,
            chapterId,
          },
          chaptersData,
        }),
      );
    }
  };

  const onAfterNavigationItemRouted = (itemValue?: string, itemType?: string) => {
    if (isMobile()) {
      dispatch(setIsSidebarNavigationVisible(false));
    }

    // If we have an item value and type, update Redux state
    if (itemValue) {
      if (itemType === NavigationItemType.PAGE) {
        updateReduxStateWithPage(itemValue);
      } else if (itemType === NavigationItemType.CHAPTER) {
        updateReduxStateWithChapter(itemValue);
      }
    }
  };

  if (selectedNavigationItem === NavigationItem.Surah) {
    return <SurahSelection onAfterNavigationItemRouted={onAfterNavigationItemRouted} />;
  }
  if (selectedNavigationItem === NavigationItem.Juz) {
    return <JuzSelection onAfterNavigationItemRouted={onAfterNavigationItemRouted} />;
  }
  if (selectedNavigationItem === NavigationItem.Verse) {
    return <VerseSelection onAfterNavigationItemRouted={onAfterNavigationItemRouted} />;
  }

  return <PageSelection onAfterNavigationItemRouted={onAfterNavigationItemRouted} />;
};

export default SidebarNavigationSelections;
