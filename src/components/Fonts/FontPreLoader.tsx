import React from 'react';

import Head from 'next/head';

import { FONT_CDN } from 'src/utils/fontFaceHelper';

const DEFAULT_LOCALE = 'en';

const LOCALE_PRELOADED_FONTS = {
  [DEFAULT_LOCALE]: [{ type: 'font/woff2', location: 'lang/ProximaVara/ProximaVara.woff2' }],
  ar: [{ type: 'font/woff2', location: 'lang/arabic/NotoNaskhArabic-Regular.woff2' }],
  bn: [{ type: 'font/ttf', location: 'lang/bengali/NotoSerifBengali-Regular.woff2' }],
  ur: [{ type: 'font/woff2', location: 'lang/urdu/notonastaliqurdu.woff2' }],
} as Record<string, { type: string; location: string }[]>;

interface Props {
  locale: string;
}

const FontPreLoader: React.FC<Props> = ({ locale }) => {
  const toBePreLoadedFonts =
    LOCALE_PRELOADED_FONTS[locale] || LOCALE_PRELOADED_FONTS[DEFAULT_LOCALE];
  return (
    <Head>
      {toBePreLoadedFonts.map((fontDetails) => (
        <link
          key={fontDetails.location}
          rel="preload"
          as="font"
          type={fontDetails.type}
          href={`${FONT_CDN}/${fontDetails.location}`}
          crossOrigin="anonymous"
        />
      ))}
    </Head>
  );
};

export default FontPreLoader;
