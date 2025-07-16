import { PagesLookUpResponse } from 'types/ApiResponses';

/**
 * Extract the first page number from existing pagesLookup data
 *
 * @param {PagesLookUpResponse | undefined} pagesLookup - The existing pages lookup data
 * @param {string} chapterNumber - The chapter number to get the first page for
 * @returns {string | null} - The first page number for the chapter or null if not found
 */
const getFirstPageFromLookup = (
  pagesLookup?: PagesLookUpResponse,
  chapterNumber?: string,
): string | null => {
  // Early returns for invalid inputs
  if (!pagesLookup || !chapterNumber) return null;

  try {
    // Get the first mushaf ID from the lookup data
    const firstPage = Object.keys(pagesLookup.pages)[0];
    if (!firstPage) return null;

    return firstPage;
  } catch {
    // Return null if any errors occur during lookup
    return null;
  }
};

/**
 * Get the first page number for a specific chapter based on the current Mushaf.
 * Uses existing pagesLookup data if available, otherwise falls back to API call.
 *
 * @param {string} chapterNumber - The chapter number to get the first page for
 * @param {PagesLookUpResponse} [existingPagesLookup] - Optional existing pagesLookup data
 * @returns {string | null} - The first page number for the chapter or null if not found
 */
const getFirstPageNumberForChapter = (
  chapterNumber?: string,
  existingPagesLookup?: PagesLookUpResponse,
): string | null => {
  // Try to get page from existing data first
  const pageFromLookup = getFirstPageFromLookup(existingPagesLookup, chapterNumber || '');
  if (pageFromLookup) return pageFromLookup;

  // If we couldn't get a page number, return null
  return null;
};

/**
 * React hook to get the first page number for a chapter using context data when available
 *
 * @param {string} chapterNumber - The chapter number to get the first page for
 * @param {PagesLookUpResponse} [pagesLookup] - The pages lookup data
 * @returns {string | null} - Function that returns the first page number or null
 */
export const useGetFirstPageNumberForChapter = (
  chapterNumber?: string,
  pagesLookup?: PagesLookUpResponse,
): string | null => getFirstPageNumberForChapter(chapterNumber || '', pagesLookup);

export default getFirstPageNumberForChapter;
