import { Theme } from './styled';

export const theme: Theme = {
  name: 'Default',
  fonts: {
    primary: 'Montserrat, sans-serif',
    secondary: 'Source Sans Pro, sans-serif',
    tertiary: 'Times New Roman, sans-serif',
  },
  colors: {
    primary: {
      faded: '#fff',
      faint: '#fff',
      medium: '#00acc1',
      deep: '#fff',
    },
    secondary: {
      faded: '#fff',
      faint: '#fff',
      medium: '#C8C8C8',
      deep: '#fff',
    },
    tertiary: {
      faded: '#fff',
      faint: '#fff',
      medium: '#fff',
      deep: '#fff',
    },
    text: {
      default: '#607d8b',
      link: '#fff',
      warning: '#fff',
      error: '#fff',
    },
    background: {
      fadedGreyScale: 'rgba(0, 0, 0, 0.06)',
      neutralGrey: '#f8f8f8',
      default: '#fff',
      fadedBlackScale: 'rgba(0, 0, 0, 0.5)',
    },
    borders: {
      hairline: 'rgb(235, 238, 240)',
    },
  },

  spacing: {
    // You can use multiples of spaces and/or combine to achieve the desired spacing. E.g "2x @mega + 1x @small"
    nano: '0.1rem',
    micro: '0.2rem',
    xxsmall: '0.4rem',
    xsmall: '0.6rem',
    small: '0.8rem',
    medium: '1rem',
    large: '1.2rem',
    mega: '2rem',
  },

  fontSizes: {
    xsmall: '0.5rem',
    small: '0.6rem',
    normal: '0.7rem',
    large: '0.8rem',
    xlarge: '1rem',
    jumbo: '1.2rem',
  },

  lineHeights: {
    small: '0.8rem',
    normal: '1rem',
    large: '1.2rem',
    xlarge: '1.4rem',
    jumbo: '1.6rem',
  },

  fontWeights: {
    normal: 400,
    bold: 700,
  },

  borderRadiuses: {
    sharp: '0',
    pill: '20rem',
    default: '0.25rem',
    circle: '50%',
  },

  shadows: {
    light: '',
    regular: 'rgba(100, 100, 111, 0.2) 0px 7px 29px 0px',
    heavy: '',
  },

  opacity: {
    30: '30%',
    50: '50%',
    75: '75%',
    85: '85%',
  },

  zIndexes: {
    min: '-999',
    default: '1',
    sticky: '300',
    header: '400',
    toast: '500',
    dropdown: '600',
    spinner: '700',
    modal: '800',
    max: '999',
  },

  breakpoints: {
    mobileS: '320px',
    mobileM: '375px',
    mobileL: '425px',
    tablet: '768px',
    laptop: '1024px',
  },

  transformations: {
    rotateXOneEighty: 'transform: rotateX(180deg);',
  },

  transitions: {
    fast: '0.3s',
    regular: '0.6s',
    slow: '0.9s',
  },
};

export const darkTheme = {
  ...theme,
};
