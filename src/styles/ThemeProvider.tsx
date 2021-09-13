import React from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { selectTheme } from 'src/redux/slices/theme';
import styles from './ThemeProvider.module.scss';

const ThemeProvider = ({ children }) => {
  const theme = useSelector(selectTheme, shallowEqual);

  if (typeof window !== 'undefined' && document.body) {
    document.body.setAttribute('data-theme', theme.type);
  }

  return <div className={styles.container}>{children}</div>;
};

export default ThemeProvider;
