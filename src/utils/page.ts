// TODO: In a follow, the Mushaf value will be retrieved from redux.
const DEFAULT_MUSHAF = 5;

// a map between the mushafId and the number of pages it has
const MUSHAF_PAGES = {
  5: 604,
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
 * @param {number} mushafId
 * @returns {boolean}
 */
export const isLastPage = (pageNumber: number, mushafId: number = DEFAULT_MUSHAF): boolean =>
  pageNumber === MUSHAF_PAGES[mushafId];
