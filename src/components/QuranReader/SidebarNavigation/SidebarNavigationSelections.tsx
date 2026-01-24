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
import NavigationItemType from '@/types/NavigationItemType';
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
  const chaptersData = useContext(DataContext);
  const lastReadVerseKey = useSelector(selectLastReadVerseKey);
  // we skip requesting any selection list if the drawer is not open.
  if (!isVisible) return <></>;

  const updateReduxStateWithPage = (pageNumber: string) => {
    dispatch(
      setLastReadVerse({
        lastReadVerse: {
          ...lastReadVerseKey,
          page: pageNumber,
          // Clear chapter and verse context when navigating by page
          // to ensure consistent Redux state
          verseKey: null,
          chapterId: null,
        },
        chaptersData,
      }),
    );
  };

  const updateReduxWithChapterOnly = (chapterId: string) => {
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
  };

  const updateReduxStateWithChapter = (chapterId: string) => {
    updateReduxWithChapterOnly(chapterId);
  };

  const onAfterNavigationItemRouted = (itemValue?: string, itemType?: string) => {
    if (isMobile()) {
      dispatch(setIsSidebarNavigationVisible(false));
    }

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
