import React, { useLayoutEffect } from 'react';

import { shallowEqual, useSelector } from 'react-redux';

import useThemeDetector from '@/hooks/useThemeDetector';
import { selectTheme } from '@/redux/slices/theme';
import ThemeTypeVariant from '@/redux/types/ThemeTypeVariant';

// Keep in sync with `--color-background-default` in src/styles/themes/_{light,dark,sepia}.scss
const THEME_COLORS: Record<ThemeTypeVariant, string> = {
  light: '#fff',
  dark: '#1f2125',
  sepia: '#f8ebd5',
};

const setThemeColorMetaTag = (color: string) => {
  let themeColorTag = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!themeColorTag) {
    themeColorTag = document.createElement('meta');
    themeColorTag.name = 'theme-color';
    document.head.appendChild(themeColorTag);
  }
  themeColorTag.setAttribute('content', color);
};

const ThemeProvider = ({ children }) => {
  const theme = useSelector(selectTheme, shallowEqual);
  const { themeVariant } = useThemeDetector();

  useLayoutEffect(() => {
    if (typeof window === 'undefined' || !document.body) {
      return;
    }
    document.body.setAttribute('data-theme', theme.type);
  }, [theme.type]);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    setThemeColorMetaTag(THEME_COLORS[themeVariant]);
  }, [themeVariant]);

  return <div>{children}</div>;
};

export default ThemeProvider;
