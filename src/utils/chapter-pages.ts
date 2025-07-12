import { QuranFont, MushafLines } from '@/types/QuranReader';
import { getMushafId } from '@/utils/api';
import { makePagesLookupUrl } from '@/utils/apiPaths';
import { PagesLookUpResponse } from 'types/ApiResponses';

/**
 * Fetches the first page number for a specific chapter based on the current Mushaf.
 * This respects different Mushaf types which may have different page counts and verse distributions.
 *
 * @param {string} chapterNumber - The chapter number to get the first page for
 * @param {QuranFont} quranFont - The current Quran font being used
 * @param {MushafLines} mushafLines - The current Mushaf lines setting
 * @returns {Promise<string>} - The first page number for the chapter
 */
const getFirstPageNumberForChapter = async (
  chapterNumber: string,
  quranFont: QuranFont,
  mushafLines?: MushafLines,
): Promise<string> => {
  try {
    // Get the current Mushaf ID based on font and lines settings
    const { mushaf } = getMushafId(quranFont, mushafLines);

    // Create the URL for the pages lookup API
    const url = makePagesLookupUrl({
      chapterNumber: Number(chapterNumber),
      mushaf,
    });

    // Fetch the data from the API
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch page numbers for chapter ${chapterNumber}`);
    }

    const data: PagesLookUpResponse = await response.json();

    // Get the first page number from the pages object
    const pageNumbers = Object.keys(data.pages);
    if (pageNumbers.length === 0) {
      throw new Error(`No pages found for chapter ${chapterNumber}`);
    }

    // Return the first page number
    return pageNumbers[0];
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error fetching first page number for chapter:', error);
    }
    throw error;
  }
};

export default getFirstPageNumberForChapter;
