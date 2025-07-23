import React, { useEffect, useMemo } from 'react';

import Head from 'next/head';

/** Default locale to fallback to when a specific locale's font is not available */
const DEFAULT_LOCALE = 'en';

/** Global registry to track which fonts have been preloaded across component instances */
const preloadedFonts = new Set<string>();

/** Font configuration for surah names that's consistent across all languages */
const SURAH_NAMES_FONT = {
  type: 'font/woff2',
  location: '/fonts/quran/surah-names/v1/sura_names.woff2',
};

/**
 * Font configurations for different locales used in the main application
 * Each locale specifies the font files needed for proper text rendering
 */
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

/** Font configuration for Indopak script used in specific locales */
const INDOPAK = {
  type: 'font/woff2',
  location: '/fonts/quran/hafs/nastaleeq/indopak/indopak-nastaleeq-waqf-lazim-v4.2.1.woff2',
};

/**
 * Font configurations specifically for the Quran Reader view
 * These fonts are optimized for Quranic text rendering
 */
const QURAN_READER_LOCALE_PRELOADED_FONTS = {
  [DEFAULT_LOCALE]: [
    { type: 'font/woff2', location: '/fonts/quran/hafs/uthmanic_hafs/UthmanicHafs1Ver18.woff2' },
  ],
  bn: [INDOPAK],
  ur: [INDOPAK],
  id: [INDOPAK],
} as Record<string, { type: string; location: string }[]>;

interface Props {
  /** Current locale/language code (e.g., 'en', 'ar', 'ur') */
  locale: string;
  /** Whether the font preload is for the Quran Reader view */
  isQuranReader?: boolean;
}

/**
 * Determines which fonts need to be preloaded based on the locale and view type
 * @param {string} locale - Current locale/language code
 * @param {boolean} isQuranReader - Whether the fonts are for Quran Reader view
 * @returns {FontConfig[]} Array of font configurations to be preloaded
 */
const getToBePreLoadedFonts = (locale: string, isQuranReader: boolean) => {
  if (!isQuranReader) {
    return LOCALE_PRELOADED_FONTS[locale] || LOCALE_PRELOADED_FONTS[DEFAULT_LOCALE];
  }
  return (
    QURAN_READER_LOCALE_PRELOADED_FONTS[locale] ||
    QURAN_READER_LOCALE_PRELOADED_FONTS[DEFAULT_LOCALE]
  );
};

/**
 * FontPreLoader component that handles preloading of font files based on locale and view type.
 * Prevents duplicate font loading across component instances using a global registry.
 * @param {object} props - Component props
 * @param {string} props.locale - Current locale/language code
 * @param {boolean} [props.isQuranReader=false] - Whether the preload is for Quran Reader view
 * @returns {JSX.Element} Rendered component
 */
const FontPreLoader: React.FC<Props> = ({ locale, isQuranReader = false }) => {
  // Memoize the fonts that need to be preloaded to prevent recalculation on every render
  const fontsToPreload = useMemo(() => {
    const toBePreLoadedFonts = getToBePreLoadedFonts(locale, isQuranReader);
    // Filter out fonts that have already been preloaded
    return toBePreLoadedFonts.filter((fontDetails) => !preloadedFonts.has(fontDetails.location));
  }, [locale, isQuranReader]);

  // Update the global registry when fontsToPreload changes
  useEffect(() => {
    fontsToPreload.forEach((fontDetails) => {
      preloadedFonts.add(fontDetails.location);
    });
  }, [fontsToPreload]);

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
