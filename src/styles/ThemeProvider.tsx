import React from 'react';

import { shallowEqual, useSelector } from 'react-redux';

import { selectTheme } from '@/redux/slices/theme';

const getThemeColorMetaTags = (theme: any) => {
  const themeColor1 = document.createElement('meta');
  const themeColor2 = document.createElement('meta');
  switch (theme) {
    case 'light': {
      themeColor1.name = 'theme-color';
      themeColor1.content = '#fff';
      return [themeColor1];
    }
    case 'dark': {
      themeColor1.name = 'theme-color';
      themeColor1.content = '#1f2125';
      return [themeColor1];
    }
    case 'sepia': {
      themeColor1.name = 'theme-color';
      themeColor1.content = '#f8ebd5';
      return [themeColor1];
    }
    default: {
      themeColor1.name = 'theme-color';
      themeColor1.media = '(prefers-color-scheme: dark)';
      themeColor1.content = '#1f2125';
      themeColor2.name = 'theme-color';
      themeColor2.media = '(prefers-color-scheme: light)';
      themeColor2.content = '#fff';
      return [themeColor1, themeColor2];
    }
  }
};

const ThemeProvider = ({ children }) => {
  const theme = useSelector(selectTheme, shallowEqual);

  if (typeof window !== 'undefined' && document.body) {
    document.body.setAttribute('data-theme', theme.type);

    const metaTags = document.getElementsByTagName('meta');
    const themeColorTags = Array.from(metaTags).filter((tag) => tag.name === 'theme-color');
    themeColorTags.forEach((tag) => tag.remove());
    getThemeColorMetaTags(theme.type).forEach((tag) => document.head.appendChild(tag));
  }

  return <div>{children}</div>;
};

export default ThemeProvider;
