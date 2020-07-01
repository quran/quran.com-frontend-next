import React from 'react';
import Document, { Head, Main, NextScript } from 'next/document';
import { ServerStyleSheet } from 'styled-components';
import { BaseCSS } from 'styled-bootstrap-grid';
import { makeGlobalCss } from '../styles/GlobalStyles';
import makeFonts, { baseUrl } from '../styles/fonts';

export default class MyDocument extends Document {
  static getInitialProps({ renderPage }) {
    // Step 1: Create an instance of ServerStyleSheet
    const sheet = new ServerStyleSheet();

    // Step 2: Retrieve styles from components in the page
    const page = renderPage((App) => (props) =>
      sheet.collectStyles(
        <>
          <BaseCSS />
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
      <html lang="en">
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
          {/* Step 5: Output the styles in the head  */}
          {styleTags}
          <style
            dangerouslySetInnerHTML={{
              __html: `
          ${makeGlobalCss()}
          ${makeFonts(baseUrl)}
          `,
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    );
  }
}
