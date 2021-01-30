import 'styled-components';

type Fonts = {
  primary: string;
  secondary: string;
  tertiary: string;
};

type ColorBase = {
  faded: string;
  faint: string;
  medium: string;
  deep: string;
};

type ColorText = {
  default: string;
  link: string;
  warning: string;
  error: string;
};

type ColorBackground = Record<string, unknown>;

type Colors = {
  primary: ColorBase;
  secondary: ColorBase;
  tertiary: ColorBase;
  text: ColorText;
  background: ColorBackground;
};

type Spacing = {
  micro: string;
  xxsmall: string;
  xsmall: string;
  small: string;
  medium: string;
  large: string;
  mega: string;
};

type FontSizes = {
  small: string;
  normal: string;
  large: string;
  xlarge: string;
  jumbo: string;
};

type LineHeights = {
  small: string;
  normal: string;
  large: string;
  xlarge: string;
  jumbo: string;
};

type FontWeights = {
  normal: number;
  bold: number;
};

type Shadows = Record<string, unknown>;
type Elevation = Record<string, unknown>;

type Breakpoints = {
  mobileS: string;
  mobileM: string;
  mobileL: string;
  tablet: string;
  laptop: string;
};

type Transitions = {
  fast: string;
  regular: string;
  slow: string;
};

export interface Theme {
  name: string;
  fonts: Fonts;
  colors: Colors;
  spacing: Spacing;
  fontSizes: FontSizes;
  lineHeights: LineHeights;
  fontWeights: FontWeights;
  shadows: Shadows;
  elevations: Elevation;
  breakpoints: Breakpoints;
  transitions: Transitions;
}

// Extends the styled components interface with the theme
declare module 'styled-components' {
  // eslint-disable-next-line
  export interface DefaultTheme extends Theme {}
}
