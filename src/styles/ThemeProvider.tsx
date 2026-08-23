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
      return undefined;
    }
    const color = THEME_COLORS[themeVariant];
    setThemeColorMetaTag(color);

    // Guard against later head reconciliations (e.g. `DefaultSeo` re-rendering with its
    // static placeholder color on unrelated navigation/state changes) reverting the tag.
    // This effect only reruns on `themeVariant` change, so without this observer the
    // meta tag would stay wrong until the next theme switch.
    const observer = new MutationObserver(() => {
      const tag = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
      if (tag && tag.getAttribute('content') !== color) {
        tag.setAttribute('content', color);
      }
    });
    observer.observe(document.head, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['content'],
    });

    return () => observer.disconnect();
  }, [themeVariant]);

  return <div>{children}</div>;
};

export default ThemeProvider;
