import range from 'lodash/range';

import { MushafLines, QuranFont } from 'types/QuranReader';
import Verse from 'types/Verse';

const QCFFontCodes = [QuranFont.MadaniV1, QuranFont.MadaniV2];
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
 * @param {boolean} isV1
 * @param {number} pageNumber
 * @returns {string}
 */
export const getV1OrV2FontFaceSource = (isV1: boolean, pageNumber: number): string => {
  const pageName = String(pageNumber).padStart(3, '0');

  if (isV1) {
    const woff2 = `/fonts/quran/hafs/v1/woff2/p${pageNumber}.woff2`;
    const woff = `/fonts/quran/hafs/v1/woff/p${pageNumber}.woff`;
    const ttf = `/fonts/quran/hafs/v1/ttf/p${pageNumber}.ttf`;
    return `local(QCF_P${pageName}), url('${woff2}') format('woff2'), url('${woff}') format('woff'), url('${ttf}') format('truetype')`;
  }

  const woff2 = `/fonts/quran/hafs/v2/woff2/p${pageNumber}.woff2`;
  const woff = `/fonts/quran/hafs/v2/woff/p${pageNumber}.woff`;

  return `local(QCF2${pageName}), url('${woff2}') format('woff2'), url('${woff}') format('woff')`;
};

/**
 * A function that will return the value of the font-face of QCF's font V1 and V2.
 * This will be used when we create a new instance of FontFace inside useQcfFont
 * hook.
 *
 * @param {boolean} isV1
 * @param {number} pageNumber
 * @returns {string}
 */
export const getFontFaceNameForPage = (isV1: boolean, pageNumber: number): string =>
  isV1 ? `p${pageNumber}-v1` : `p${pageNumber}-v2`;

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
