import _ from 'lodash';
import VerseType from 'types/VerseType';

/**
 * Groups verses into pages to match the Quran Page (Mushaf) layout
 * The returning value is an object containing the page number as a key,
 * and array of verses for the value. E.g.
 * {
 *  Page1: [verses],
 *  Page2: [verses]
 *  ...
 * }
 */
const groupPagesByVerses = (verses: VerseType[]) => {
  // Groups the verses based on their page number
  const pages = _.groupBy(verses, (verse) => {
    /* TODO: (@naveed-ahmad) change the api to send page_number based on font type.
         Then remove this assignment */

    // eslint-disable-next-line no-param-reassign
    verse.pageNumber = verse.v1Page || verse.v2Page;
    return `Page${verse.pageNumber}`;
  });

  return pages;
};

export default groupPagesByVerses;
