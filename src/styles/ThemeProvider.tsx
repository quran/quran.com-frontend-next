import React from 'react';

import { shallowEqual, useSelector } from 'react-redux';

import { selectTheme } from '@/redux/slices/theme';

const getThemeColorMetaTags = (theme) => {
  switch (theme) {
    case 'auto': {
      const themeColorTag1 = document.createElement('meta');
      const themeColorTag2 = document.createElement('meta');
      themeColorTag1.name = 'theme-color';
      themeColorTag1.media = '(prefers-color-scheme: dark)';
      themeColorTag1.content = '#1f2125';
      themeColorTag2.name = 'theme-color';
      themeColorTag2.media = '(prefers-color-scheme: light)';
      themeColorTag2.content = '#fff';
      return [themeColorTag1, themeColorTag2];
    }
    case 'light': {
      const themeColorTag = document.createElement('meta');
      themeColorTag.name = 'theme-color';
      themeColorTag.content = '#fff';
      return [themeColorTag];
    }
    case 'dark': {
      const themeColorTag = document.createElement('meta');
      themeColorTag.name = 'theme-color';
      themeColorTag.content = '#1f2125';
      return [themeColorTag];
    }
    case 'sepia': {
      const themeColorTag = document.createElement('meta');
      themeColorTag.name = 'theme-color';
      themeColorTag.content = '#f8ebd5';
      return [themeColorTag];
    }
    default: {
      const themeColorTag1 = document.createElement('meta');
      const themeColorTag2 = document.createElement('meta');
      themeColorTag1.name = 'theme-color';
      themeColorTag1.media = '(prefers-color-scheme: dark)';
      themeColorTag1.content = '#1f2125';
      themeColorTag2.name = 'theme-color';
      themeColorTag2.media = '(prefers-color-scheme: light)';
      themeColorTag2.content = '#fff';
      return [themeColorTag1, themeColorTag2];
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
