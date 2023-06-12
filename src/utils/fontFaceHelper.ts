import range from 'lodash/range';

import { MushafLines, QuranFont } from 'types/QuranReader';
import Verse from 'types/Verse';

const QCFFontCodes = [QuranFont.MadaniV1, QuranFont.MadaniV2, QuranFont.TajweedV4];

export enum QCFFontVersion {
  V1 = 'v1',
  V2 = 'v2',
  V4 = 'v4',
}
export const isQCFFont = (font: QuranFont) => QCFFontCodes.includes(font);

/**
 * Get the page numbers of a group of verses by getting
 * the page number of the first verse, the page number of the last verse
 * and generating the range between both of them.
 *
 * @param {Verse[]} verses
 * @returns {number[]}
 */
export const getPagesByVerses = (verses: Verse[]): number[] => {
  const firstPage = verses[0].pageNumber;
  const lastPage = verses[verses.length - 1].pageNumber;

  return range(firstPage, lastPage + 1);
};

/**
 * A function that will return the value of the src of QCF's font V1 and V2.
 * This will be used when we create a new instance of FontFace inside useQcfFont
 * hook.
 *
 * @param {QuranFont} quranFont
 * @param {number} pageNumber
 * @returns {string}
 */
export const getQCFFontFaceSource = (quranFont: QuranFont, pageNumber: number): string => {
  const pageName = String(pageNumber).padStart(3, '0');
  const version = quranFontToVersion(quranFont);

  const prefixesMap = {
    [QuranFont.MadaniV1]: 'QCF_P',
    [QuranFont.MadaniV2]: 'QCF2',
    [QuranFont.TajweedV4]: 'QCF4_P',
  };

  const woff2 = `/fonts/quran/hafs/${version}/woff2/p${pageNumber}.woff2`;
  const woff = `/fonts/quran/hafs/${version}/woff/p${pageNumber}.woff`;
  const ttf = `/fonts/quran/hafs/${version}/ttf/p${pageNumber}.ttf`;
  return `local(${prefixesMap[quranFont]}${pageName}), url('${woff2}') format('woff2'), url('${woff}') format('woff'), url('${ttf}') format('truetype')`;
};

/**
 * Convert Quran font name to version
 * code_v1 -> v1, code_v2 -> v2, tajweed_v4 -> v4
 *
 * @param {QuranFont} quranFont
 * @returns {QCFFontVersion}
 */
export const quranFontToVersion = (quranFont: QuranFont): QCFFontVersion =>
  quranFont.replace('code_', '').replace('tajweed_', '') as QCFFontVersion;

/**
 * A function that will return the value of the font-face of QCF's font V1, V2 and V4.
 * This will be used when we create a new instance of FontFace inside useQcfFont
 * hook.
 *
 * @param {QuranFont} quranFont
 * @param {number} pageNumber
 * @returns {string}
 */
export const getFontFaceNameForPage = (quranFont: QuranFont, pageNumber: number): string =>
  `p${pageNumber}-${quranFontToVersion(quranFont)}`;

/**
 * Dynamically generate the className of the combination between the font
 * name + size + mushafLines(when its Indopak) that will match the output of
 * generate-font-scales function inside {@see _utility.scss}.
 *
 * @param {QuranFont} quranFont
 * @param {number} fontScale
 * @param {MushafLines} mushafLines
 * @param {boolean} isFallbackFont
 * @returns {string}
 */
export const getFontClassName = (
  quranFont: QuranFont,
  fontScale: number,
  mushafLines: MushafLines,
  isFallbackFont = false,
): string => {
  if (quranFont === QuranFont.IndoPak) {
    return `${quranFont}_${mushafLines}-font-size-${fontScale}`;
  }
  return isFallbackFont
    ? `fallback_${quranFont}-font-size-${fontScale}`
    : `${quranFont}-font-size-${fontScale}`;
};

/**
 * Dynamically generate the className of the combination between the font
 * name + size that will match the output of
 * generate-font-scales function inside {@see _utility.scss}.
 *
 * @param {QuranFont} quranFont
 * @param {number} fontScale
 * @param {MushafLines} mushafLines
 * @param {boolean} isFallbackFont
 * @returns {string}
 */
export const getLineWidthClassName = (
  quranFont: QuranFont,
  fontScale: number,
  mushafLines: MushafLines,
  isFallbackFont = false,
): string => {
  if (quranFont === QuranFont.IndoPak) {
    return `${quranFont}_${mushafLines}-line-width-${fontScale}`;
  }

  return isFallbackFont
    ? `fallback_${quranFont}-line-width-${fontScale}`
    : `${quranFont}-line-width-${fontScale}`;
};
