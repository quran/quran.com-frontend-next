import React from 'react';
import { useSelector } from 'react-redux';
import { selectTheme } from 'src/redux/slices/theme';

const ThemeProvider = ({ children }) => {
  const theme = useSelector(selectTheme);

  return <div data-theme={theme.type}>{children}</div>;
};

export default ThemeProvider;
