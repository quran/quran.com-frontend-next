import React from 'react';

import dynamic from 'next/dynamic';

import SidebarSelectionSkeleton from './SidebarSelectionSkeleton';

import { NavigationItem } from 'src/redux/slices/QuranReader/sidebarNavigation';

const PageSelection = dynamic(() => import('./PageSelection'), {
  loading: SidebarSelectionSkeleton,
});
const SurahSelection = dynamic(() => import('./SurahSelection'), {
  loading: SidebarSelectionSkeleton,
});
const JuzSelection = dynamic(() => import('./JuzSelection'), {
  loading: SidebarSelectionSkeleton,
});

type Props = {
  isVisible: boolean;
  selectedNavigationItem: string;
};

const SidebarNavigationSelections: React.FC<Props> = ({ isVisible, selectedNavigationItem }) => {
  // we skip requesting any selection list if the drawer is not open.
  if (!isVisible) {
    return <></>;
  }
  if (selectedNavigationItem === NavigationItem.Surah) {
    return <SurahSelection />;
  }
  if (selectedNavigationItem === NavigationItem.Juz) {
    return <JuzSelection />;
  }
  return <PageSelection />;
};

export default SidebarNavigationSelections;
