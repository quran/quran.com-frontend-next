import { useContext } from 'react';

import { getPagesLookup } from '@/api';
import { QuranFont, MushafLines } from '@/types/QuranReader';
import { getMushafId } from '@/utils/api';
import DataContext from 'src/contexts/DataContext';
import { PagesLookUpRequest } from 'types/ApiRequests';
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
 * Fetch the first page number for a chapter from the API
 *
 * @param {string} chapterNumber - The chapter number to fetch
 * @param {QuranFont} quranFont - The current Quran font
 * @param {MushafLines} [mushafLines] - The current Mushaf lines setting
 * @returns {Promise<string | null>} - Promise resolving to the first page number or null if not found
 */
const fetchFirstPageFromApi = async (
  chapterNumber: string,
  quranFont: QuranFont,
  mushafLines?: MushafLines,
): Promise<string | null> => {
  try {
    const { mushaf } = getMushafId(quranFont, mushafLines);

    // Use the existing getPagesLookup function from the API module
    const params: PagesLookUpRequest = {
      chapterNumber: Number(chapterNumber),
      mushaf,
    };
    const data = await getPagesLookup(params);

    const pageNumbers = Object.keys(data.pages);

    if (pageNumbers.length === 0) {
      return null;
    }

    return pageNumbers[0];
  } catch (error) {
    // Catch any unexpected errors and return null
    return null;
  }
};

/**
 * Get the first page number for a specific chapter based on the current Mushaf.
 * Uses existing pagesLookup data if available, otherwise falls back to API call.
 *
 * @param {string} chapterNumber - The chapter number to get the first page for
 * @param {QuranFont} quranFont - The current Quran font being used
 * @param {MushafLines} [mushafLines] - The current Mushaf lines setting
 * @param {PagesLookUpResponse} [existingPagesLookup] - Optional existing pagesLookup data
 * @returns {Promise<string | null>} - The first page number for the chapter or null if not found
 */
const getFirstPageNumberForChapter = async (
  chapterNumber: string,
  quranFont: QuranFont,
  mushafLines?: MushafLines,
  existingPagesLookup?: PagesLookUpResponse,
): Promise<string | null> => {
  // Try to get page from existing data first
  const pageFromLookup = getFirstPageFromLookup(existingPagesLookup, chapterNumber);
  if (pageFromLookup) return pageFromLookup;

  // Fall back to API call if needed
  const apiResult = await fetchFirstPageFromApi(chapterNumber, quranFont, mushafLines);

  // If we couldn't get a page number, return null instead of throwing
  return apiResult || null;
};

/**
 * React hook to get the first page number for a chapter using context data when available
 *
 * @param {string} chapterNumber - The chapter number to get the first page for
 * @param {QuranFont} quranFont - The current Quran font being used
 * @param {MushafLines} [mushafLines] - The current Mushaf lines setting
 * @param {any} [externalChaptersData] - Optional external chapters data to use instead of context
 * @returns {() => Promise<string | null>} - Function that returns a promise with the first page number or null
 */
export const useGetFirstPageNumberForChapter = (
  chapterNumber: string,
  quranFont: QuranFont,
  mushafLines?: MushafLines,
  externalChaptersData?: any,
) => {
  // Use external data if provided, otherwise use context
  const contextData = useContext(DataContext);
  const chaptersData = externalChaptersData || contextData.chaptersData;

  return async () => {
    // Safe access to pagesLookup with proper type handling
    const pagesLookup =
      chaptersData && 'pagesLookup' in chaptersData
        ? (chaptersData.pagesLookup as unknown as PagesLookUpResponse)
        : undefined;

    return getFirstPageNumberForChapter(chapterNumber, quranFont, mushafLines, pagesLookup);
  };
};

export default getFirstPageNumberForChapter;
