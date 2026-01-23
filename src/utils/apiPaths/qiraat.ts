import { makeUrl } from '../api';

/**
 * Compose the URL for the Qiraat matrix API
 *
 * @param verseKey - The verse key (e.g., "10:35")
 * @param language - Language code (e.g., "en", "ar")
 * @returns API URL string
 */
export const makeQiraatMatrixUrl = (verseKey: string, language: string): string =>
  makeUrl(`/qiraat/matrix/by_verse/${verseKey}`, { language });
