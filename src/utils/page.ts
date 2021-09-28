import { QuranFont, QuranFontMushaf } from 'src/components/QuranReader/types';

const DEFAULT_NUMBER_OF_PAGES = 604;

// a map between the mushafId and the number of pages it has
const PAGES_MUSHAF_MAP = {
  7: 548,
  6: 610,
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
 * @returns {boolean}
 */
export const isLastPage = (pageNumber: number, quranFont?: QuranFont): boolean => {
  if (!quranFont) {
    return pageNumber === DEFAULT_NUMBER_OF_PAGES;
  }
  // if the mushaf id is not found in the map, it means we should use the default one
  const totalMushafPages = PAGES_MUSHAF_MAP[QuranFontMushaf[quranFont]] || DEFAULT_NUMBER_OF_PAGES;
  return pageNumber === totalMushafPages;
};
