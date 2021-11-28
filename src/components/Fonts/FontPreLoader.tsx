import React from 'react';

import Head from 'next/head';

const DEFAULT_LOCALE = 'en';

const LOCALE_PRELOADED_FONTS = {
  [DEFAULT_LOCALE]: [
    { type: 'font/woff2', location: 'ProximaVara/proxima_vara_regular.woff2' },
    { type: 'font/woff2', location: 'ProximaVara/proxima_vara_semibold.woff2' },
    { type: 'font/woff2', location: 'ProximaVara/proxima_vara_bold.woff2' },
  ],
  ar: [{ type: 'font/woff2', location: 'AlJazeera/Al-Jazeera-Regular.woff2' }],
  bn: [{ type: 'font/ttf', location: 'NotoSerifBengali/NotoSerifBengali-Regular.ttf' }],
  ur: [{ type: 'font/woff2', location: 'urdu/NotoNaskhArabic-Regular.woff' }],
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
          href={`/fonts/${fontDetails.location}`}
          crossOrigin="anonymous"
        />
      ))}
    </Head>
  );
};

export default FontPreLoader;
