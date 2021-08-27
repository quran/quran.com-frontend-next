import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectTheme } from 'src/redux/slices/theme';
import styles from './ThemeProvider.module.scss';

const ThemeProvider = ({ children }) => {
  const theme = useSelector(selectTheme);
  useEffect(() => {
    if (theme) {
      document.body.setAttribute('data-theme', theme.type);
    }
  }, [theme]);

  return <div className={styles.container}>{children}</div>;
};

export default ThemeProvider;
