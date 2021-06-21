import _ from 'lodash';
import VerseType from 'types/VerseType';

/**
 * Groups verses into pages to match the Quran Page (Mushaf) layout
 * The returning value is an object containing the page number as a key,
 * and array of verses for the value. E.g.
 * {
 *  1: [verses],
 *  2: [verses]
 *  ...
 * }
 */
const groupPagesByVerses = (verses: VerseType[]) => {
  // Groups the verses based on their page number
  const pages = _.groupBy(verses, (verse) => {
    return verse.pageNumber;
  });

  return pages;
};

export default groupPagesByVerses;
