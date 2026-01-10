import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';
import Script from 'next/script';

import { getDir } from '@/utils/locale';

const DEFAULT_LOCALE = 'en';

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps, locale: ctx?.locale || DEFAULT_LOCALE };
  }

  render = () => (
    <Html dir={getDir(this.props.locale)} lang={this.props.locale}>
      <Head />
      <body>
        <Main />
        <NextScript />
        {/* Mind Rockets Access In Hand - Accessibility Plugin */}
        <Script
          src="https://cdn.mindrocketsapis.com/client/Latest/jquery-3.7.1.js"
          strategy="afterInteractive"
        />
        <Script
          src="https://cdn.mindrocketsapis.com/client/Latest/toolkit.js"
          strategy="afterInteractive"
        />
        <Script
          src="https://cdn.mindrocketsapis.com/client/Latest/mrmegapack.bundle.js"
          strategy="afterInteractive"
        />
        <Script
          src="https://cdn.mindrocketsapis.com/client/MRUAP/quran/integrator-uap.js"
          strategy="afterInteractive"
        />
      </body>
    </Html>
  );
}

export default MyDocument;
