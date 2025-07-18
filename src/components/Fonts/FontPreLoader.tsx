import React, { useEffect, useState } from 'react';

import Head from 'next/head';

const DEFAULT_LOCALE = 'en';

// Global registry to track which fonts have been preloaded
const preloadedFonts = new Set<string>();

const SURAH_NAMES_FONT = {
  type: 'font/woff2',
  location: '/fonts/quran/surah-names/v1/sura_names.woff2',
};

const LOCALE_PRELOADED_FONTS = {
  [DEFAULT_LOCALE]: [
    { type: 'font/ttf', location: '/fonts/lang/Figtree/Figtree.ttf' },
    { ...SURAH_NAMES_FONT },
  ],
  ar: [
    { type: 'font/woff2', location: '/fonts/lang/arabic/NotoNaskhArabic-Regular.woff2' },
    { ...SURAH_NAMES_FONT },
  ],
  bn: [
    { type: 'font/woff2', location: '/fonts/lang/bengali/NotoSerifBengali-Regular.woff2' },
    { ...SURAH_NAMES_FONT },
  ],
  ur: [
    { type: 'font/woff2', location: '/fonts/lang/urdu/MehrNastaliqWeb.woff2' },
    { ...SURAH_NAMES_FONT },
  ],
} as Record<string, { type: string; location: string }[]>;

const INDOPAK = {
  type: 'font/woff2',
  location: '/fonts/quran/hafs/nastaleeq/indopak/indopak-nastaleeq-waqf-lazim-v4.2.1.woff2',
};

const QURAN_READER_LOCALE_PRELOADED_FONTS = {
  [DEFAULT_LOCALE]: [
    { type: 'font/woff2', location: '/fonts/quran/hafs/uthmanic_hafs/UthmanicHafs1Ver18.woff2' },
  ],
  bn: [INDOPAK],
  ur: [INDOPAK],
  id: [INDOPAK],
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
  const [fontsToPreload, setFontsToPreload] = useState<Array<{ type: string; location: string }>>(
    [],
  );

  useEffect(() => {
    const toBePreLoadedFonts = getToBePreLoadedFonts(locale, isQuranReader);
    // Filter out fonts that have already been preloaded
    const newFontsToPreload = toBePreLoadedFonts.filter(
      (fontDetails) => !preloadedFonts.has(fontDetails.location),
    );

    // Add new fonts to the preloaded registry
    newFontsToPreload.forEach((fontDetails) => {
      preloadedFonts.add(fontDetails.location);
    });

    setFontsToPreload(newFontsToPreload);
  }, [locale, isQuranReader]);

  return (
    <Head>
      {fontsToPreload.map((fontDetails) => (
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
