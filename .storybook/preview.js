import { addDecorator, addParameters } from '@storybook/react';
import { ThemeProvider } from 'styled-components';
import { withA11y } from '@storybook/addon-a11y';
import { withKnobs } from '@storybook/addon-knobs';

import { theme } from '../src/utils/styles';

const themeDecorator = (storyFn) => <ThemeProvider theme={theme}>{storyFn()}</ThemeProvider>;
// V6
// export const decorators = [themeDecorator];
// Consider using this: https://github.com/echoulen/storybook-addon-styled-component-theme
addDecorator(themeDecorator);
const viewports = {
  xsmall: {
    name: 'X Small',
    styles: {
      width: `320px`,
      height: '100%',
    },
  },
  small: {
    name: 'Small',
    styles: {
      width: `${theme.breakpoints.sm - 1}px`,
      height: '100%',
    },
  },
  medium: {
    name: 'Medium',
    styles: {
      width: `${theme.breakpoints.md}px`,
      height: '100%',
    },
  },
  large: {
    name: 'Large',
    styles: {
      width: `${theme.breakpoints.lg}px`,
      height: '100%',
    },
  },
  xlarge: {
    name: 'X Large',
    styles: {
      width: `${theme.breakpoints.xl}px`,
      height: '100%',
    },
  },
};
addParameters({
  viewport: {
    viewports: {
      ...viewports,
    },
  },
});
addDecorator(withA11y);
addDecorator(
  withKnobs({
    escapeHTML: false,
  }),
);
