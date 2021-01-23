import { createGlobalStyle } from 'styled-components';
import makeFonts from './fonts';
import resetCSS from './reset';

export const makeGlobalCss = (baseSize = 16) =>
  `html {
  font-size: ${baseSize}px;
}
${resetCSS}
`
    .replace(/\n/g, '')
    .replace(/\s/g, '');

const GlobalStyle = createGlobalStyle`
  ${makeGlobalCss()}
  ${makeFonts()}
`;

export default GlobalStyle;
