import React from 'react';
import Document, { Head, Main, NextScript } from 'next/document';
import { ServerStyleSheet, createGlobalStyle } from 'styled-components';
import { BaseCSS } from 'styled-bootstrap-grid';

const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'Maison Neue';
    src: url('/static/fonts/MaisonNeue-Medium.otf');
    /* src: url('/static/fonts/MaisonNeue-Bold.eot'); */
    /* src: url('/static/fonts/MaisonNeue-Bold.ttf'); */
    /* src: url('/static/fonts/MaisonNeueWEB-Bold.woff'); */
    /* src: url('/static/fonts/MaisonNeueWEB-Bold.woff2'); */
  }

  @font-face {
    font-family: 'Schear Grotesk';
    /* src: url('/static/fonts/SchearGrotesk-Black.eot'); */
    /* src: url('/static/fonts/SchearGrotesk-Black.ttf'); */
    src: url('/static/fonts/SchearGrotesk-Black.otf');
    /* src: url('/static/fonts/SchearGrotesk-Black.woff'); */
    /* src: url('/static/fonts/SchearGrotesk-Black.woff2'); */
  }
`;
export default class MyDocument extends Document {
  static getInitialProps({ renderPage }) {
    // Step 1: Create an instance of ServerStyleSheet
    const sheet = new ServerStyleSheet();

    // Step 2: Retrieve styles from components in the page
    const page = renderPage((App) => (props) =>
      sheet.collectStyles(
        <>
          <BaseCSS />
          <GlobalStyle />
          <App {...props} />
        </>,
      ),
    );

    // Step 3: Extract the styles as <style> tags
    const styleTags = sheet.getStyleElement();

    // Step 4: Pass styleTags as a prop
    return { ...page, styleTags };
  }

  render() {
    // @ts-ignore
    const { styleTags } = this.props;

    return (
      <html>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

          {/* Step 5: Output the styles in the head  */}
          {styleTags}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    );
  }
}
