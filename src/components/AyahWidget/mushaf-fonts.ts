import ThemeTypeVariant from '@/redux/types/ThemeTypeVariant';
import type { MushafType } from '@/types/ayah-widget';
import { QuranFont } from '@/types/QuranReader';
import { getFontFaceNameForPage, isQCFFont } from '@/utils/fontFaceHelper';

// Use the public CDN for external widget usage
const QURAN_FONT_CDN = 'https://verses.quran.foundation/fonts/quran';

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
      // King Fahad fonts use QCF per-page fonts, fallback to Uthmani
      return "UthmanicHafs, 'Traditional Arabic', serif";
    case 'tajweed':
      // Tajweed uses QCF per-page fonts, fallback to Uthmani
      return "UthmanicHafs, 'Traditional Arabic', serif";
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
 * Uses the public CDN (verses.quran.foundation) for external widget embedding.
 * @param {MushafType} mushaf The mushaf type.
 * @param {number} pageNumber The page number.
 * @param {ThemeTypeVariant} theme The theme variant.
 * @returns {string | null} The font-face source string or null if not applicable.
 */
export const buildQcffFontFaceSource = (
  mushaf: MushafType,
  pageNumber: number,
  theme: ThemeTypeVariant,
): string | null => {
  const quranFont = getQuranFontForMushaf(mushaf);
  if (!isQCFFont(quranFont)) return null;

  // Build the font path based on the Quran font type
  const pageName = String(pageNumber).padStart(3, '0');
  let fontPath = '';
  let localPrefix = '';

  if (quranFont === QuranFont.MadaniV1) {
    fontPath = 'hafs/v1';
    localPrefix = 'QCF_P';
  } else if (quranFont === QuranFont.MadaniV2) {
    fontPath = 'hafs/v2';
    localPrefix = 'QCF2';
  } else if (quranFont === QuranFont.TajweedV4) {
    // For Tajweed V4, use colrv1 by default (works in most browsers)
    // In Firefox dark mode, the component will need to use ot-svg/dark
    const isFirefoxDarkMode = theme === 'dark'; // Simplified check for widget
    fontPath = isFirefoxDarkMode ? 'hafs/v4/ot-svg/dark' : 'hafs/v4/colrv1';
    localPrefix = 'QCF4_P';
  } else {
    return null;
  }

  const baseUrl = QURAN_FONT_CDN;
  const woff2 = `${baseUrl}/${fontPath}/woff2/p${pageNumber}.woff2`;
  const woff = `${baseUrl}/${fontPath}/woff/p${pageNumber}.woff`;
  const ttf = `${baseUrl}/${fontPath}/ttf/p${pageNumber}.ttf`;

  return `local(${localPrefix}${pageName}), url('${woff2}') format('woff2'), url('${woff}') format('woff'), url('${ttf}') format('truetype')`;
};

/**
 * Builds the complete font-face CSS for a specific Quran mushaf.
 * @param {MushafType} mushaf The mushaf type.
 * @param {number} pageNumber The page number.
 * @param {ThemeTypeVariant} theme The theme variant.
 * @returns {string} The complete @font-face CSS rule.
 */
export const buildQcffFontFaceCss = (
  mushaf: MushafType,
  pageNumber: number,
  theme: ThemeTypeVariant,
): string => {
  const src = buildQcffFontFaceSource(mushaf, pageNumber, theme);
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
 * Builds the @font-face CSS for all mushaf fonts (Uthmani, IndoPak, etc.).
 * Uses the public CDN (verses.quran.foundation) for external widget embedding.
 * @returns {string} The complete @font-face CSS rules.
 */
export const buildMushafFontFaceCss = (): string => {
  const baseUrl = QURAN_FONT_CDN;
  return `
@font-face {
  font-family: 'UthmanicHafs';
  src:
    local('KFGQPC HAFS Uthmanic Script'),
    url('${baseUrl}/hafs/uthmanic_hafs/UthmanicHafs1Ver18.woff2') format('woff2');
  font-display: swap;
}

@font-face {
  font-family: 'IndoPak';
  src:
    local('AlQuran IndoPak by QuranWBW'),
    url('${baseUrl}/hafs/nastaleeq/indopak/indopak-nastaleeq-waqf-lazim-v4.2.1.woff2') format('woff2');
  font-display: swap;
}
`;
};
