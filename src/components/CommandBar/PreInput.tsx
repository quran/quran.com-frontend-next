import React from 'react';

import { useSelector } from 'react-redux';

import CommandsList from './CommandsList';

import { selectRecentNavigations } from 'src/redux/slices/commandBar';
import { areArraysEqual } from 'src/utils/array';

const PreInput: React.FC = () => {
  const recentNavigations = useSelector(selectRecentNavigations, areArraysEqual);
  return <CommandsList navigationItems={recentNavigations} isPreInput />;
};

export default PreInput;
