import range from 'lodash/range';

import { QuranFont } from 'types/QuranReader';
import Verse from 'types/Verse';

const QCFFontCodes = [QuranFont.MadaniV1, QuranFont.MadaniV2];
export const FONT_CDN = 'https://static.qurancdn.com/fonts';

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

  if(isV1) {
    return `local(QCF_P${pageName}), url('${FONT_CDN}/fonts/v1/woff2/p${pageNumber}.woff2') format('woff2'), url('${FONT_CDN}/fonts/v1/woff/p${pageNumber}.woff') format('woff'), url('${FONT_CDN}/fonts/v1/ttf/p${pageNumber}.ttf') format('truetype')`
  } else {
    return `local(QCF2${pageName}), url('${FONT_CDN}/fonts/v2/woff2/p${pageNumber}.woff2') format('woff2'), url('${FONT_CDN}/fonts/v2/woff/p${pageNumber}.woff') format('woff')`;
  }
}

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
