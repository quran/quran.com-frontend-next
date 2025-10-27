/* eslint-disable jsdoc/require-returns */
/* eslint-disable max-lines */
import React, { useMemo } from 'react';

import Head from 'next/head';

import { QuranFont } from '@/types/QuranReader';

const DEFAULT_LOCALE = 'en';

type FontFormat = 'woff2' | 'woff' | 'opentype' | 'truetype';

type FontSource = {
  format: FontFormat;
  path: string;
};

type FontFaceConfig = {
  display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
  family: string;
  preload?: boolean;
  sources: FontSource[];
  stretch?: string;
  style?: string;
  unicodeRange?: string;
  weight?: string;
};

const BASE_FONT_FACES: FontFaceConfig[] = [
  {
    family: 'Figtree',
    sources: [{ format: 'woff2', path: '/fonts/lang/Figtree/Figtree-latin-400-700.woff2' }],
    stretch: '50% 100%',
    weight: '100 900',
    display: 'fallback',
    preload: true,
  },
  {
    family: 'surahnames',
    sources: [
      { format: 'woff2', path: '/fonts/quran/surah-names/v1/sura_names.woff2' },
      { format: 'woff', path: '/fonts/quran/surah-names/v1/sura_names.woff' },
    ],
    style: 'normal',
    weight: '400',
    display: 'fallback',
  },
  {
    family: 'PlayfairDisplay',
    sources: [{ format: 'woff2', path: '/fonts/lang/PlayfairDisplay/PlayfairDisplay-Black.woff2' }],
    style: 'normal',
    weight: '900',
    display: 'optional',
  },
  {
    family: 'UthmanicHafs',
    sources: [
      { format: 'woff2', path: '/fonts/quran/hafs/uthmanic_hafs/UthmanicHafs1Ver18.woff2' },
      { format: 'truetype', path: '/fonts/quran/hafs/uthmanic_hafs/UthmanicHafs1Ver18.ttf' },
    ],
    style: 'normal',
    weight: '400',
    display: 'fallback',
    unicodeRange: 'U+0600-06FF, U+F000-FFFF',
  },
  {
    family: 'IndoPak',
    sources: [
      {
        format: 'woff2',
        path: '/fonts/quran/hafs/nastaleeq/indopak/indopak-nastaleeq-waqf-lazim-v4.2.1.woff2',
      },
      {
        format: 'woff',
        path: '/fonts/quran/hafs/nastaleeq/indopak/indopak-nastaleeq-waqf-lazim-v4.2.1.woff',
      },
      {
        format: 'truetype',
        path: '/fonts/quran/hafs/nastaleeq/indopak/indopak-nastaleeq-waqf-lazim-v4.2.1.ttf',
      },
    ],
    style: 'normal',
    weight: '400',
    display: 'fallback',
    unicodeRange: 'U+0600-06FF, U+F000-FFFF',
  },
];

const LOCALE_FONT_FACES: Record<string, FontFaceConfig[]> = {
  [DEFAULT_LOCALE]: [],
  ar: [
    {
      family: 'NotoNastaliq',
      sources: [{ format: 'woff2', path: '/fonts/lang/arabic/NotoNaskhArabic-Regular.woff2' }],
      style: 'normal',
      weight: '400',
      display: 'fallback',
      unicodeRange: 'U+0600-06FF',
    },
  ],
  bn: [
    {
      family: 'NotoSerifBengali',
      sources: [{ format: 'woff2', path: '/fonts/lang/bengali/NotoSerifBengali-Regular.woff2' }],
      style: 'normal',
      weight: '400',
      display: 'fallback',
      unicodeRange: 'U+0980-09FF',
    },
  ],
  dv: [
    {
      family: 'divehi',
      sources: [{ format: 'woff2', path: '/fonts/lang/dhivehi/DhivehiAkuru.woff2' }],
      style: 'normal',
      weight: '400',
      display: 'fallback',
      unicodeRange: 'U+0780-07BF',
    },
  ],
  ku: [
    {
      family: 'DroidArabicNaskh',
      sources: [
        { format: 'woff2', path: '/fonts/lang/kurdish/droid-naskh-regular.woff2' },
        { format: 'woff', path: '/fonts/lang/kurdish/droid-naskh-regular.woff' },
      ],
      style: 'normal',
      weight: '400',
      display: 'fallback',
      unicodeRange: 'U+0600-06FF',
    },
  ],
  ur: [
    {
      family: 'MehrNastaliq',
      sources: [
        { format: 'woff2', path: '/fonts/lang/urdu/MehrNastaliqWeb.woff2' },
        { format: 'woff', path: '/fonts/lang/urdu/MehrNastaliqWeb.woff' },
      ],
      style: 'normal',
      weight: '400',
      display: 'fallback',
      unicodeRange: 'U+0600-06FF',
    },
  ],
};

const UTHMANIC_FONT: FontFaceConfig = {
  family: 'UthmanicHafs',
  sources: [
    { format: 'woff2', path: '/fonts/quran/hafs/uthmanic_hafs/UthmanicHafs1Ver18.woff2' },
    { format: 'truetype', path: '/fonts/quran/hafs/uthmanic_hafs/UthmanicHafs1Ver18.ttf' },
  ],
  style: 'normal',
  weight: '400',
  display: 'fallback',
  unicodeRange: 'U+0600-06FF',
  preload: true,
};

const INDOPAK_FONT: FontFaceConfig = {
  family: 'IndoPak',
  sources: [
    {
      format: 'woff2',
      path: '/fonts/quran/hafs/nastaleeq/indopak/indopak-nastaleeq-waqf-lazim-v4.2.1.woff2',
    },
    {
      format: 'woff',
      path: '/fonts/quran/hafs/nastaleeq/indopak/indopak-nastaleeq-waqf-lazim-v4.2.1.woff',
    },
    {
      format: 'truetype',
      path: '/fonts/quran/hafs/nastaleeq/indopak/indopak-nastaleeq-waqf-lazim-v4.2.1.ttf',
    },
  ],
  style: 'normal',
  weight: '400',
  display: 'fallback',
  unicodeRange: 'U+0600-06FF, U+F000-FFFF',
  preload: true,
};

const QURAN_READER_FONT_FACES: Record<string, FontFaceConfig[]> = {
  [DEFAULT_LOCALE]: [UTHMANIC_FONT],
  bn: [INDOPAK_FONT],
  ur: [INDOPAK_FONT],
  id: [INDOPAK_FONT],
};

const QURAN_FONT_FACE_BY_FONT: Partial<Record<QuranFont, FontFaceConfig[]>> = {
  [QuranFont.Uthmani]: [UTHMANIC_FONT],
  [QuranFont.QPCHafs]: [UTHMANIC_FONT],
  [QuranFont.IndoPak]: [INDOPAK_FONT, UTHMANIC_FONT],
};

interface Props {
  locale: string;
  isQuranReader?: boolean;
  quranFont?: QuranFont;
}

const dedupeFontFaces = (fontFaces: FontFaceConfig[]) => {
  const seen = new Set<string>();
  return fontFaces.filter((font) => {
    if (seen.has(font.family)) {
      return false;
    }
    seen.add(font.family);
    return true;
  });
};

/**
 * Pick the fonts that should always be present for a locale.
 * Includes global UI fonts plus any language-specific extras.
 */
const getLocaleFontFaces = (locale: string) => [
  ...BASE_FONT_FACES,
  ...(LOCALE_FONT_FACES[locale] || LOCALE_FONT_FACES[DEFAULT_LOCALE]),
];

/**
 * Base pack of Quran reader fonts for a locale (used on reader pages).
 */
const getQuranFontFaces = (locale: string) =>
  QURAN_READER_FONT_FACES[locale] || QURAN_READER_FONT_FACES[DEFAULT_LOCALE];

/**
 * Extra fonts that only load when the reader picks a specific Quran font (e.g. IndoPak).
 */
const getQuranFontFacesBySelection = (quranFont?: QuranFont) =>
  (quranFont && QURAN_FONT_FACE_BY_FONT[quranFont]) || [];

/**
 * Turn our config objects into actual @font-face CSS so the browser can fetch the files.
 */
const createFontFaceCss = (fontFaces: FontFaceConfig[]) =>
  fontFaces
    .map((font) =>
      `
@font-face {
  font-family: '${font.family}';
  font-style: ${font.style || 'normal'};
  font-weight: ${font.weight || '400'};
  ${font.stretch ? `font-stretch: ${font.stretch};` : ''}
  font-display: ${font.display || 'fallback'};
  ${font.unicodeRange ? `unicode-range: ${font.unicodeRange};` : ''}
  src: ${font.sources
    .map((source) => `url('${source.path}') format('${source.format}')`)
    .join(',\n        ')};
}
`.trim(),
    )
    .join('\n');

/**
 * Injects the right fonts for the current locale and Quran font selection.
 * Only preloads what is needed so we keep the first paint fast.
 */
const FontPreLoader: React.FC<Props> = ({ locale, isQuranReader = false, quranFont }) => {
  const fontFaces = useMemo(() => {
    if (isQuranReader) {
      return dedupeFontFaces([
        ...getQuranFontFaces(locale),
        ...getQuranFontFacesBySelection(quranFont),
      ]);
    }

    return dedupeFontFaces(getLocaleFontFaces(locale));
  }, [isQuranReader, locale, quranFont]);

  const fontFaceCss = useMemo(() => createFontFaceCss(fontFaces), [fontFaces]);
  const preloadableFonts = fontFaces.filter((font) => font.preload);

  return (
    <Head>
      {preloadableFonts.map((font) => (
        <link
          key={font.family}
          rel="preload"
          as="font"
          href={font.sources[0].path}
          type={`font/${font.sources[0].format}`}
          crossOrigin="anonymous"
        />
      ))}
      {fontFaceCss ? (
        <style
          key={`font-face-${isQuranReader ? 'quran' : 'locale'}`}
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: fontFaceCss }}
        />
      ) : null}
    </Head>
  );
};

export default FontPreLoader;
