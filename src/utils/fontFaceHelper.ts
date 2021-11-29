import range from 'lodash/range';

import { QuranFont } from 'types/QuranReader';
import Verse from 'types/Verse';

const QCFFontCodes = [QuranFont.MadaniV1, QuranFont.MadaniV2];

export const isQCFFont = (font: QuranFont) => QCFFontCodes.includes(font);

/**
 * Get the page numbers of a group of verses but getting
 * the page number of the first verse, the page number of the last verse
 * and generating the range between both of them.
 *
 * @param {Verse[]} verses
 * @returns {number[]}
 */
export const getVersesPages = (verses: Verse[]): number[] => {
  const firstPage = verses[0].pageNumber;
  const lastPage = verses[verses.length - 1].pageNumber;

  return range(firstPage, lastPage + 1);
};

export const getFontFaceSource = (isV1: boolean, pageNumber: number): string =>
  isV1
    ? `url('/fonts/v1/woff2/p${pageNumber}.woff2') format('woff2'), url('/fonts/v1/woff/p${pageNumber}.woff') format('woff'), url('/fonts/v1/ttf/p${pageNumber}.ttf') format('truetype')`
    : `url('/fonts/v2/woff2/p${pageNumber}.woff2') format('woff2'), url('/fonts/v2/woff/p${pageNumber}.woff') format('woff')`;

export const getFontFaceName = (isV1: boolean, pageNumber: number): string =>
  isV1 ? `p${pageNumber}-v1` : `p${pageNumber}-v2`;
