import React from 'react';
import { useSelector } from 'react-redux';
import { selectTheme } from 'src/redux/slices/theme';
import styles from './ThemeProvider.module.scss';

const ThemeProvider = ({ children }) => {
  const theme = useSelector(selectTheme);

  return (
    <div data-theme={theme.type}>
      <div className={styles.container}>{children}</div>
    </div>
  );
};

export default ThemeProvider;
