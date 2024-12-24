import { useEffect, useState } from 'react';

import { shallowEqual, useSelector } from 'react-redux';

import { selectTheme } from '@/redux/slices/theme';
import ThemeType from '@/redux/types/ThemeType';
import ThemeTypeVariant from '@/redux/types/ThemeTypeVariant';
import isClient from '@/utils/isClient';

const getDarkThemePreferences = () => window.matchMedia('(prefers-color-scheme: dark)');

/**
 * listenes to the media query dark mode and parsing the auto type to dark or light returning isDarkMode boolean
 * and the settingsTheme with Auto type, and themeVariant without Auto type
 *
 * @returns {{isDarkTheme: boolean, settingsTheme: {type: ThemeType}, themeVariant: ThemeTypeVariant}}
 */

const useThemeDetector = () => {
  const [isDarkTheme, setIsDarkTheme] = useState(getCurrentTheme());
  const settingsTheme: { type: ThemeType } = useSelector(selectTheme, shallowEqual);

  const getThemeVariant = () => {
    if (settingsTheme.type === ThemeType.Auto) {
      return isDarkTheme ? ThemeType.Dark : ThemeType.Light;
    }
    return settingsTheme.type;
  };

  const themeVariant: ThemeTypeVariant = getThemeVariant();

  const mediaQueryListener = (e) => {
    setIsDarkTheme(e.matches);
  };

  useEffect(() => {
    if (!isClient) {
      return null;
    }

    const darkThemeMediaQuery = getDarkThemePreferences();
    darkThemeMediaQuery.addEventListener('change', mediaQueryListener);
    return () => darkThemeMediaQuery.removeEventListener('change', mediaQueryListener);
  }, []);

  return { isDarkTheme, settingsTheme, themeVariant };
};

const getCurrentTheme = () => {
  if (!isClient) {
    return false;
  }

  return getDarkThemePreferences().matches;
};

export default useThemeDetector;
