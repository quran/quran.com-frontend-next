import { addDecorator, addParameters } from '@storybook/react';

import ResetCSS from '../src/styles/reset.scss';
import Theme from '../src/styles/theme.scss'
import GlobalFonts from '../src/styles/fonts.scss';

const themeDecorator = (storyFn) => (
  <>
    <link rel="stylesheet" href={GlobalFonts} />
    <link rel="stylesheet" href={ResetCSS} />
    <link rel="stylesheet" href={Theme} />
    <div>
      {storyFn()}
    </div>
  </>
);

// V6
// export const decorators = [themeDecorator];
addDecorator(themeDecorator);

const viewports = {
  mobileS: {
    name: 'MobileS',
    styles: {
      width: `320px`,
      height: '100%',
    },
  },
  mobileM: {
    name: 'MobileM',
    styles: {
      width: `375px`,
      height: '100%',
    },
  },
  mobileL: {
    name: 'MobileL',
    styles: {
      width: `425px`,
      height: '100%',
    },
  },
  tablet: {
    name: 'Tablet',
    styles: {
      width: `768px`,
      height: '100%',
    },
  },
  desktop: {
    name: 'Desktop',
    styles: {
      width: `1024px`,
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
