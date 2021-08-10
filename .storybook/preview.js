import { addDecorator, addParameters } from '@storybook/react';
import { withA11y } from '@storybook/addon-a11y';
import { withKnobs } from '@storybook/addon-knobs';

import { theme, darkTheme } from '../src/styles/theme';
import ResetCSS from '../src/styles/reset.css';
import GlobalFonts from '../src/styles/fonts.css';

const themes = [theme, darkTheme];


const themeDecorator = (storyFn) => (
  <>
    <link rel="stylesheet" href={ResetCSS} />
    <link rel="stylesheet" href={GlobalFonts} />

    <div>
      {storyFn()}
    </div>
  </>
);

// V6
// export const decorators = [themeDecorator];
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
