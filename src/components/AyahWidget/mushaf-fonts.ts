import ThemeTypeVariant from '@/redux/types/ThemeTypeVariant';
import type { MushafType } from '@/types/ayah-widget';
import { QuranFont } from '@/types/QuranReader';
import { getFontFaceNameForPage, getQCFFontFaceSource, isQCFFont } from '@/utils/fontFaceHelper';

const getAssetBase = (): string => {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || '';
};

/**
 * Gets the font family for a specific mushaf.
 * @param {MushafType} mushaf The mushaf type.
 * @returns {string} The corresponding font family.
 */
export const getMushafFontFamily = (mushaf: MushafType): string => {
  switch (mushaf) {
    case 'indopak':
      return "IndoPak, 'Mehr Nastaliq Web', 'Noto Nastaliq', serif";
    case 'kfgqpc_v1':
    case 'kfgqpc_v2':
      return "MushafElMadinah, UthmanicHafs, 'Traditional Arabic', serif";
    case 'tajweed':
      return "TajweedV4, UthmanicHafs, 'Traditional Arabic', serif";
    case 'qpc':
    default:
      return "UthmanicHafs, 'Traditional Arabic', 'Arabic Typesetting', 'Scheherazade', serif";
  }
};

/**
 * Gets the Quran font for a specific mushaf.
 * @param {MushafType} mushaf The mushaf type.
 * @returns {QuranFont} The corresponding Quran font.
 */
export const getQuranFontForMushaf = (mushaf: MushafType): QuranFont => {
  switch (mushaf) {
    case 'indopak':
      return QuranFont.IndoPak;
    case 'kfgqpc_v1':
      return QuranFont.MadaniV1;
    case 'kfgqpc_v2':
      return QuranFont.MadaniV2;
    case 'tajweed':
      return QuranFont.TajweedV4;
    case 'qpc':
    default:
      return QuranFont.QPCHafs;
  }
};

/**
 * Builds the font-face source for a specific Quran mushaf.
 * @param {MushafType} mushaf The mushaf type.
 * @param {number} pageNumber The page number.
 * @param {ThemeTypeVariant} theme The theme variant.
 * @param {string} assetBase The base URL for assets.
 * @returns {string | null} The font-face source string or null if not applicable.
 */
export const buildQcffFontFaceSource = (
  mushaf: MushafType,
  pageNumber: number,
  theme: ThemeTypeVariant,
  assetBase: string = getAssetBase(),
): string | null => {
  const quranFont = getQuranFontForMushaf(mushaf);
  if (!isQCFFont(quranFont)) return null;

  return getQCFFontFaceSource(quranFont, pageNumber, theme).replace(
    /url\(["']\//g,
    `url('${assetBase}/`,
  );
};

/**
 * Builds the complete font-face CSS for a specific Quran mushaf.
 * @param {MushafType} mushaf The mushaf type.
 * @param {number} pageNumber The page number.
 * @param {ThemeTypeVariant} theme The theme variant.
 * @param {string} assetBase The base URL for assets.
 * @returns {string} The complete @font-face CSS rule.
 */
export const buildQcffFontFaceCss = (
  mushaf: MushafType,
  pageNumber: number,
  theme: ThemeTypeVariant,
  assetBase: string = getAssetBase(),
): string => {
  const src = buildQcffFontFaceSource(mushaf, pageNumber, theme, assetBase);
  if (!src) return '';

  const quranFont = getQuranFontForMushaf(mushaf);
  const fontFamily = getFontFaceNameForPage(quranFont, pageNumber);
  return `
@font-face {
  font-family: '${fontFamily}';
  src: ${src};
  font-display: swap;
}
`;
};

/**
 * Builds the @font-face CSS for a specific mushaf.
 * @param {string} assetBase The base URL for assets.
 * @returns {string} The complete @font-face CSS rule.
 */
export const buildMushafFontFaceCss = (assetBase: string = getAssetBase()): string => `
@font-face {
  font-family: 'UthmanicHafs';
  src:
    local('KFGQPC HAFS Uthmanic Script'),
    url('${assetBase}/fonts/quran/hafs/uthmanic_hafs/UthmanicHafs1Ver18.woff2') format('woff2');
  font-display: swap;
}

@font-face {
  font-family: 'IndoPak';
  src:
    local('AlQuran IndoPak by QuranWBW'),
    url('${assetBase}/fonts/quran/hafs/nastaleeq/indopak/indopak-nastaleeq-waqf-lazim-v4.2.1.woff2') format('woff2');
  font-display: swap;
}

@font-face {
  font-family: 'MushafElMadinah';
  src:
    local('Mushaf El Madinah'),
    url('${assetBase}/fonts/quran/hafs/me_quran/me_quran-2.woff2') format('woff2');
  font-display: swap;
}

@font-face {
  font-family: 'TajweedV4';
  src:
    local('QCF Tajweed V4'),
    url('${assetBase}/fonts/quran/hafs/v4/colrv1/woff2/p001.woff2') format('woff2');
  font-display: swap;
}
`;
