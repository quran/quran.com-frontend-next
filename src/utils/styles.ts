import merge from 'lodash/merge';

export const theme = {
  base: {
    unit: 1, // base font-size is 16px
  },
  colors: {
    primary: '#00acc1',
    white: '#fff',
    text: '#607d8b',
  },
  breakpoints: {
    sm: '576px',
    md: '768px',
    lg: '992px',
    xl: '1200px',
  },
};

export const darkTheme = merge({}, theme, {
  ...theme,
  colors: {
    text: '#fff',
  },
});

export const darkModeTheme = {
  colors: {},
};
