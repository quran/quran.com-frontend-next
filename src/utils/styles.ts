import { css } from 'styled-components';
import merge from 'lodash/merge';

const BASE_PX = 16;
const fonts = {
  montserrat: 'Montserrat, sans-serif',
  sourceSans: 'Source Sans Pro, sans-serif',
  timesNew: 'Times New Roman, sans-serif',
};
const makeRem = (size: number) => `${size / BASE_PX}rem`;

export const theme = {
  name: 'Default',
  backgroundColor: '#fff',
  fonts,
  fontSizes: [makeRem(12), makeRem(14), makeRem(16), makeRem(20), makeRem(24), makeRem(32)],
  base: {
    px: BASE_PX,
    unit: 1, // base font-size is 16px
  },
  border: {
    radius: 4,
  },
  colors: {
    primary: '#00acc1',
    white: '#fff',
    text: '#607d8b',
    gray: '#777',
    black: '#000000',
    red: '#e50000',
    yellow: '#F2A026',
    green: '#5FD855',
    blue: '#0085CA',
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
  name: 'Dark',
  backgroundColor: '#111',
  colors: {
    text: '#fff',
  },
});

export const resetButton = css`
  appearance: none;
  background: transparent;
  cursor: pointer;
  margin: 0px;
  padding: 0px;
  border: 0;
  user-select: auto;
  text-decoration: none;
  font-size: inherit;
  vertical-align: middle;
  display: inline-block;
`;
