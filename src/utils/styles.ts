export const theme = {
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
      medium: '#fff',
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
      // TODO: @Aqeel: add tokens for the backround colors
    },
  },

  // For the following sections, these are the rem dimensions that we used at Twitter (info is public).
  spacing: {
    // You can use multiples of spaces and/or combine to achieve the desired spacing. E.g "2x @mega + 1x @small"
    micro: '0.2rem',
    xxsmall: '0.4rem',
    xsmall: '0.6rem',
    small: '0.8rem',
    medium: '1rem',
    large: '1.2rem',
    mega: '2rem',
  },

  fontSizes: {
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

  shadows: {
    // TODO: @Aqeel: add tokens for the shadows
  },

  elevations: {
    // TODO: @Aqeel: add tokens for the elevation
  },

  breakpoints: {
    mobileS: '320px',
    mobileM: '375px',
    mobileL: '425px',
    tablet: '768px',
    laptop: '1024px',
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
