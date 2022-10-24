import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';

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
      </body>
    </Html>
  );
}

export default MyDocument;
