import { useEffect, useState } from 'react';

import { shallowEqual, useSelector } from 'react-redux';

import { selectTheme } from '@/redux/slices/theme';
import ThemeType from '@/redux/types/ThemeType';
import ThemeTypeVariant from '@/redux/types/ThemeTypeVariant';

const useThemeDetector = () => {
  const getCurrentTheme = () => window.matchMedia('(prefers-color-scheme: dark)').matches;
  const [isDarkTheme, setIsDarkTheme] = useState(getCurrentTheme());
  const settingsTheme = useSelector(selectTheme, shallowEqual);

  const getThemeVariant = () => {
    if (settingsTheme.type === ThemeType.Auto) {
      return isDarkTheme ? ThemeType.Dark : ThemeType.Light;
    }
    return settingsTheme.type;
  };

  const themeVariant: ThemeTypeVariant = getThemeVariant();

  const mqListener = (e) => {
    setIsDarkTheme(e.matches);
  };

  useEffect(() => {
    const darkThemeMq = window.matchMedia('(prefers-color-scheme: dark)');
    darkThemeMq.addEventListener('change', mqListener);
    return () => darkThemeMq.removeEventListener('change', mqListener);
  }, []);

  return { isDarkTheme, settingsTheme, themeVariant };
};

export default useThemeDetector;
