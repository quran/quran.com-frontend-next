import React from 'react';

import dynamic from 'next/dynamic';

import SidebarSelectionSkeleton from './SidebarSelectionSkeleton';

import {
  IsSidebarNavigationVisible,
  NavigationItem,
} from '@/redux/slices/QuranReader/sidebarNavigation';

const PageSelection = dynamic(() => import('./PageSelection'), {
  loading: SidebarSelectionSkeleton,
});
const SurahSelection = dynamic(() => import('./SurahSelection'), {
  loading: SidebarSelectionSkeleton,
});
const JuzSelection = dynamic(() => import('./JuzSelection'), {
  loading: SidebarSelectionSkeleton,
});
// const HizbSelection = dynamic(() => import('./HizbSelection'), {
//   loading: SidebarSelectionSkeleton,
// });

type Props = {
  isVisible: IsSidebarNavigationVisible;
  selectedNavigationItem: string;
};

const SidebarNavigationSelections: React.FC<Props> = ({ isVisible, selectedNavigationItem }) => {
  // we skip requesting any selection list if the drawer is not open.
  if (!isVisible) return <></>;

  if (selectedNavigationItem === NavigationItem.Surah) return <SurahSelection />;
  if (selectedNavigationItem === NavigationItem.Juz) return <JuzSelection />;
  // if (selectedNavigationItem === NavigationItem.Hizb) return <HizbSelection />;

  return <PageSelection />;
};

export default SidebarNavigationSelections;
