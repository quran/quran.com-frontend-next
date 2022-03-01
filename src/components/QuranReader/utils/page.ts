import LookupRecord from 'types/LookupRecord';

/**
 * Get the page number by adding the first page number of the current
 * resource e.g. chapter to the item (page) index from the virtualized list.
 *
 * @param {number} pageIndex
 * @param {Record<number, LookupRecord>} pagesVersesRange
 * @returns {number}
 */
export const getPageNumberByPageIndex = (
  pageIndex: number,
  pagesVersesRange: Record<number, LookupRecord>,
): number => Number(Object.keys(pagesVersesRange)[0]) + pageIndex;

/**
 * Get the page index by the page number.
 *
 * @param {number} pageNumber
 * @param {Record<number, LookupRecord>} pagesVersesRange
 * @returns {number}
 */
export const getPageIndexByPageNumber = (
  pageNumber: number,
  pagesVersesRange: Record<number, LookupRecord>,
): number => Number(pageNumber) - Number(Object.keys(pagesVersesRange)[0]);

/**
 * Get the number of pages of the current resource e.g. chapter.
 *
 * @param {number} numberOfVerses
 * @param {number} versesPerPage
 * @returns {number}
 */
export const getNumberOfPages = (numberOfVerses: number, versesPerPage: number): number =>
  Math.ceil(numberOfVerses / versesPerPage);

/**
 * Convert a verse index to a page number by dividing the index
 * by how many items there are in a page.
 *
 * @param {number} verseNumber
 * @param {number} versesPerPage
 * @returns {number}
 */
export const verseIndexToApiPageNumber = (verseNumber: number, versesPerPage: number): number =>
  Math.floor(verseNumber / versesPerPage) + 1;
