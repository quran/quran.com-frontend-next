import React from 'react';

import dynamic from 'next/dynamic';
import { useDispatch } from 'react-redux';

import SidebarSelectionSkeleton from './SidebarSelectionSkeleton';

import {
  IsSidebarNavigationVisible,
  NavigationItem,
  setIsSidebarNavigationVisible,
} from '@/redux/slices/QuranReader/sidebarNavigation';
import { isMobile } from '@/utils/responsive';

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
  // we skip requesting any selection list if the drawer is not open.
  if (!isVisible) return <></>;

  const onAfterNavigationItemRouted = () => {
    const isDeviceMobile = isMobile();
    // close the sidebar if the device is mobile after navigation
    if (isDeviceMobile) {
      dispatch({ type: setIsSidebarNavigationVisible.type, payload: false });
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
