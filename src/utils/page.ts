import { toLocalizedNumber } from './locale';

import { Mushaf, MushafLines, QuranFont, QuranFontMushaf } from 'types/QuranReader';

const DEFAULT_NUMBER_OF_PAGES = 604;

// a map between the mushafId and the number of pages it has
export const PAGES_MUSHAF_MAP = {
  [Mushaf.Indopak]: 604,
  [Mushaf.KFGQPCHAFS]: 604,
  [Mushaf.QCFV1]: 604,
  [Mushaf.QCFV2]: 604,
  [Mushaf.UthmaniHafs]: 604,
  [Mushaf.Indopak16Lines]: 548,
  [Mushaf.Indopak15Lines]: 610,
  [Mushaf.Tajweed]: 604,
  [Mushaf.QCFTajweedV4]: 604,
};

/**
 * Whether the current page is the first page.
 *
 * @param {number} surahNumber
 * @returns  {boolean}
 */
export const isFirstPage = (surahNumber: number): boolean => surahNumber === 1;

/**
 * Whether the current page is the last page.
 *
 * @param {number} pageNumber
 * @param {QuranFont} quranFont
 * @param {MushafLines} mushafLines
 * @returns {boolean}
 */
export const isLastPage = (
  pageNumber: number,
  quranFont?: QuranFont,
  mushafLines?: MushafLines,
): boolean => pageNumber === getMushafTotalPageNumber(quranFont, mushafLines);

/**
 * Get the number of pages of the current mushaf based on the selected font
 * and the number of line (in the case of IndoPak).
 *
 * @param {QuranFont} quranFont
 * @param {MushafLines} mushafLines
 * @returns {number}
 */
const getMushafTotalPageNumber = (quranFont?: QuranFont, mushafLines?: MushafLines): number => {
  let mushafTotalPages = 0;
  // this is when we are SSR the page because those 2 values won't be there since they come from Redux
  if (!quranFont || !mushafLines) {
    mushafTotalPages = DEFAULT_NUMBER_OF_PAGES;
  } else if (quranFont === QuranFont.IndoPak) {
    mushafTotalPages =
      mushafLines === MushafLines.SixteenLines
        ? PAGES_MUSHAF_MAP[Mushaf.Indopak16Lines]
        : PAGES_MUSHAF_MAP[Mushaf.Indopak15Lines];
  } else {
    mushafTotalPages = PAGES_MUSHAF_MAP[QuranFontMushaf[quranFont]];
  }
  return mushafTotalPages;
};

/**
 * Return array of page id
 *
 * @returns {{value: number, label: string}[]}
 */
export const getPageIdsByMushaf = (
  lang: string,
  quranFont?: QuranFont,
  mushafLines?: MushafLines,
): { value: number; label: string }[] =>
  [...Array(getMushafTotalPageNumber(quranFont, mushafLines))].map((n, index) => {
    const page = index + 1;
    return { value: page, label: toLocalizedNumber(page, lang) };
  });

/**
 * Get the number of lines in a Mushaf page based on the Mushaf.
 * All Mushafs have 15 lines except for Indopak 16-line one.
 *
 * @param {QuranFont} quranFont
 * @param {MushafLines} mushafLines
 * @returns {number}
 */
export const getMushafLinesNumber = (quranFont: QuranFont, mushafLines: MushafLines): number => {
  if (
    quranFont !== QuranFont.IndoPak ||
    (quranFont === QuranFont.IndoPak && mushafLines === MushafLines.FifteenLines)
  ) {
    return 15;
  }
  return 16;
};
