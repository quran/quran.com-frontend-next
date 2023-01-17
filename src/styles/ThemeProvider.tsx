import React from 'react';

import { shallowEqual, useSelector } from 'react-redux';

import { selectTheme } from '@/redux/slices/theme';
import isClient from '@/utils/isClient';

const ThemeProvider = ({ children }) => {
  const theme = useSelector(selectTheme, shallowEqual);

  if (isClient && document.body) {
    document.body.setAttribute('data-theme', theme.type);
  }

  return <div>{children}</div>;
};

export default ThemeProvider;
