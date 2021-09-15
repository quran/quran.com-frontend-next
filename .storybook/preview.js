import ResetCSS from '../src/styles/reset.scss';
import Theme from '../src/styles/theme.scss'
import GlobalFonts from '../src/styles/fonts.scss';

const themeDecorator = (Story, context) => {
  const theme = context.globals.theme;
  return (
    <>
      <link rel="stylesheet" href={GlobalFonts} />
      <link rel="stylesheet" href={ResetCSS} />
      <link rel="stylesheet" href={Theme} />
      <div data-theme={theme}>
        <Story />
      </div>
    </>
  );
};


export const decorators = [themeDecorator];
export const globalTypes = {
  theme: {
    name: 'Theme',
    description: 'Global theme for components',
    defaultValue: 'light',
    toolbar: {
      icon: 'circlehollow',
      items: ['light', 'dark', 'sepia'],
      showName: true,
    },
  },
};


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
export const parameters = {
  viewport: {
    viewports,
  },
  backgrounds: {
    default: 'light',
    // the hex colors is taken from `--color-background-default` in _light.scss, _dark.scss and _sepia.scss
    values: [
      {
        name: 'light',
        value: '#fff',
      },
      {
        name: 'dark',
        value: '#1f2125',
      },
      {
        name: 'sepia',
        value: '#f4ecd8'
      }
    ],
  },
}
