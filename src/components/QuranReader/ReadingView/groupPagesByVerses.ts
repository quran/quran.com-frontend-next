import groupBy from 'lodash/groupBy';

import Verse from 'types/Verse';

/**
 * Groups verses into pages to match the Quran Page (Mushaf) layout
 * The returning value is an object containing the page number as a key,
 * and array of verses for the value. E.g.
 * {
 *  1: [verses],
 *  2: [verses]
 *  ...
 * }
 *
 * @returns {Record<number, Verse[]>}
 */
const groupPagesByVerses = (verses: Verse[]): Record<number, Verse[]> => {
  // Groups the verses based on their page number
  const pages = groupBy(verses, (verse) => verse.pageNumber);

  return pages;
};

export default groupPagesByVerses;
