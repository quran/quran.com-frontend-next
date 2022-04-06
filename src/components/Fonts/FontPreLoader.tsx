import React from 'react';

import Head from 'next/head';

const DEFAULT_LOCALE = 'en';

const LOCALE_PRELOADED_FONTS = {
  [DEFAULT_LOCALE]: [
    { type: 'font/woff2', location: '/fonts/lang/ProximaVara/ProximaVara.woff2' },
    { type: 'font/ttf', location: '/fonts/lang/Amiri/Amiri-Regular.ttf' },
  ],
  ar: [{ type: 'font/woff2', location: '/fonts/lang/arabic/NotoNaskhArabic-Regular.woff2' }],
  bn: [{ type: 'font/woff2', location: '/fonts/lang/bengali/NotoSerifBengali-Regular.woff2' }],
  ur: [{ type: 'font/woff2', location: '/fonts/lang/urdu/MehrNastaliqWeb.woff2' }],
} as Record<string, { type: string; location: string }[]>;

const QURAN_READER_LOCALE_PRELOADED_FONTS = {
  [DEFAULT_LOCALE]: [
    { type: 'font/woff2', location: '/fonts/quran/hafs/uthmanic_hafs/UthmanicHafs1Ver18.woff2' },
  ],
  bn: [
    {
      type: 'font/woff2',
      location: '/fonts/quran/hafs/nastaleeq/indopak/indopak-nastaleeq-waqf-lazim-v4.woff2',
    },
  ],
  ur: [
    {
      type: 'font/woff2',
      location: '/fonts/quran/hafs/nastaleeq/indopak/indopak-nastaleeq-waqf-lazim-v4.woff2',
    },
  ],
  id: [
    {
      type: 'font/woff2',
      location: '/fonts/quran/hafs/nastaleeq/indopak/indopak-nastaleeq-waqf-lazim-v4.woff2',
    },
  ],
} as Record<string, { type: string; location: string }[]>;

interface Props {
  locale: string;
  isQuranReader?: boolean;
}

const getToBePreLoadedFonts = (locale: string, isQuranReader: boolean) => {
  if (!isQuranReader) {
    return LOCALE_PRELOADED_FONTS[locale] || LOCALE_PRELOADED_FONTS[DEFAULT_LOCALE];
  }
  return (
    QURAN_READER_LOCALE_PRELOADED_FONTS[locale] ||
    QURAN_READER_LOCALE_PRELOADED_FONTS[DEFAULT_LOCALE]
  );
};

const FontPreLoader: React.FC<Props> = ({ locale, isQuranReader = false }) => {
  const toBePreLoadedFonts = getToBePreLoadedFonts(locale, isQuranReader);

  return (
    <Head>
      {toBePreLoadedFonts.map((fontDetails) => (
        <link
          key={fontDetails.location}
          rel="preload"
          as="font"
          type={fontDetails.type}
          href={fontDetails.location}
          crossOrigin="anonymous"
        />
      ))}
    </Head>
  );
};

export default FontPreLoader;
