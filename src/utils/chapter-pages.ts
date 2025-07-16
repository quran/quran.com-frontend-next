import { PagesLookUpResponse } from 'types/ApiResponses';

/**
 * Extract the first page number from existing pagesLookup data
 *
 * @param {PagesLookUpResponse | undefined} pagesLookup - The existing pages lookup data
 * @returns {string | null} - The first page number for the chapter or null if not found
 */
const getFirstPageFromLookup = (pagesLookup?: PagesLookUpResponse): string | null => {
  // Early returns for invalid inputs
  if (!pagesLookup) return null;

  // Get the smallest numeric key from the lookup data
  const numericKeys = Object.keys(pagesLookup.pages)
    .map((key) => parseInt(key, 10))
    .filter((key) => !Number.isNaN(key));
  const firstPage = numericKeys.length > 0 ? Math.min(...numericKeys).toString() : null;
  return firstPage;
};

/**
 * Get the first page number for a specific chapter based on the current Mushaf.
 * Uses existing pagesLookup data if available, otherwise falls back to API call.
 *
 * @param {PagesLookUpResponse} [pagesLookup] - Optional existing pagesLookup data
 * @returns {string | null} - The first page number for the chapter or null if not found
 */
const getFirstPageNumberForChapter = (pagesLookup?: PagesLookUpResponse): string | null => {
  // Try to get page from existing data first
  const pageFromLookup = getFirstPageFromLookup(pagesLookup);
  if (pageFromLookup) return pageFromLookup;

  // If we couldn't get a page number, return null
  return null;
};

/**
 * React hook to get the first page number for a chapter using context data when available
 *
 * @param {PagesLookUpResponse} [pagesLookup] - The pages lookup data
 * @returns {string | null} - Function that returns the first page number or null
 */
export const useGetFirstPageNumberForChapter = (pagesLookup?: PagesLookUpResponse): string | null =>
  getFirstPageNumberForChapter(pagesLookup);

export default getFirstPageNumberForChapter;
