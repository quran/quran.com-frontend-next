import { Mushaf, MushafLines, QuranFont, QuranFontMushaf } from 'types/QuranReader';

const DEFAULT_NUMBER_OF_PAGES = 604;

// a map between the mushafId and the number of pages it has
const PAGES_MUSHAF_MAP = {
  [Mushaf.Indopak]: 604,
  [Mushaf.KFGQPCHAFS]: 604,
  [Mushaf.QCFV1]: 604,
  [Mushaf.QCFV2]: 604,
  [Mushaf.UthmaniHafs]: 604,
  [Mushaf.Indopak16Lines]: 548,
  [Mushaf.Indopak15Lines]: 610,
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
): boolean => {
  if (!quranFont || !mushafLines) {
    return pageNumber === DEFAULT_NUMBER_OF_PAGES;
  }
  let mushafTotalPages = PAGES_MUSHAF_MAP[QuranFontMushaf[quranFont]];
  if (quranFont === QuranFont.IndoPak) {
    mushafTotalPages =
      mushafLines === MushafLines.SixteenLines
        ? PAGES_MUSHAF_MAP[Mushaf.Indopak15Lines]
        : PAGES_MUSHAF_MAP[Mushaf.Indopak16Lines];
  }
  return pageNumber === mushafTotalPages;
};
