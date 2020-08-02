import _ from 'lodash';
import VerseType from 'types/VerseType';

/**
 * Groups verses into lines to match the Quran Page (Mushaf) layout
 * The returning value is an object containing the page and line number as a key,
 * and array of word for the value. E.g.
 * {
 *  Page1-Line2: [words],
 *  Page1-Line3: [words]
 *  ...
 * }
 *
 * Note: as a potential performance improvement, we can memoize the calls in the function
 * In my (@abdellatif) tests it doesn't seem to be necessary
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
  const lines = _.groupBy(words, (word) => {
    return `Page${word.pageNumber}-Line${word.lineNumber}`;
  });

  return lines;
};

export default groupLinesByVerses;
