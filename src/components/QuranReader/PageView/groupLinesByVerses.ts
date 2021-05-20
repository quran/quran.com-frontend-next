import _ from 'lodash';
import VerseType from 'types/VerseType';

/**
 * Groups verses into lines to match the Quran Page (Madani Mushaf) layout
 * The returning value is an object containing the page and line number as a key,
 * and array of word for the value. E.g.
 * {
 *  Page1-Line2: [words],
 *  Page1-Line3: [words]
 *  ...
 * }
 */
const groupLinesByVerses = (verses: VerseType[]) => {
  const words = [];

  // Flattens the verses into an array of words
  verses.forEach((verse) => {
    verse.words.forEach((word) => {
      words.push(word);
    });
  });

  // Groups the words based on their (page and) line number
  /* TODO: (@naveed-ahmad) use v1Page, v2page instead. Depneds on font type use has selected.
       OR change the backend to send pageNumber based on font type user has requested
  */
  const lines = _.groupBy(words, (word) => {
    // eslint-disable-next-line no-param-reassign
    word.pageNumber = word.v1Page || word.v2Page;
    return `Page${word.pageNumber}-Line${word.lineNumber}`;
  });

  return lines;
};

export default groupLinesByVerses;
