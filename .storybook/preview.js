import ResetCSS from '../src/styles/reset.scss';
import Theme from '../src/styles/theme.scss'
import GlobalFonts from '../src/styles/fonts.scss';
import GlobalStyles from '../src/styles/global.scss';

const themeDecorator = (Story, context) => {
  const theme = context.globals.theme;
  return (
    <>
      <link rel="stylesheet" href={GlobalFonts} />
      <link rel="stylesheet" href={ResetCSS} />
      <link rel="stylesheet" href={Theme} />
      <link rel="stylesheet" href={GlobalStyles} />
      <div data-theme={theme}>
        <div style={{
           backgroundColor: 'var(--color-background-default)',
           width: '100vw',
           height: '100vh',
           padding: '1rem',
          }}>
          <Story />
        </div>
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
  layout: 'fullscreen',
  viewport: {
    viewports,
  },
}
