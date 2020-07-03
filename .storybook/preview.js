import { addDecorator, addParameters } from '@storybook/react';
import { withA11y } from '@storybook/addon-a11y';
import { withKnobs } from '@storybook/addon-knobs';
import styled, { ThemeProvider } from 'styled-components';

import { theme, darkTheme } from '../src/utils/styles';
import makeFonts, { baseUrl } from '../src/styles/fonts';
import { makeGlobalCss } from '../src/styles/GlobalStyles';

const themes = [theme, darkTheme];
const Wrapper = styled.div`
  background-color: ${({ theme }) => theme.backgroundColor};
  min-height: 100vh;
`;

const themeDecorator = (storyFn) => (
  <ThemeProvider theme={themes[0]}>
    <Wrapper>
      <style dangerouslySetInnerHTML={{ __html: makeFonts(baseUrl) }} />
      <style dangerouslySetInnerHTML={{ __html: makeGlobalCss(16) }} />
      {storyFn()}
    </Wrapper>
  </ThemeProvider>
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
