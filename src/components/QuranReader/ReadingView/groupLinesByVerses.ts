import groupBy from 'lodash/groupBy';

import { getVerseWords } from '@/utils/verse';
import Verse from 'types/Verse';
import Word from 'types/Word';

/**
 * Groups verses into lines to match the Quran Page (Madani Mushaf) layout
 * The returning value is an object containing the page and line number as a key,
 * and array of word for the value. E.g.
 * {
 *  Page1-Line2: [words],
 *  Page1-Line3: [words]
 *  ...
 * }
 *
 * @returns {Record<string, Word[]}
 */
const groupLinesByVerses = (verses: Verse[]): Record<string, Word[]> => {
  let words = [];

  // Flattens the verses into an array of words
  verses.forEach((verse) => {
    words = [...words, ...getVerseWords(verse, true)];
  });

  // Groups the words based on their (page and) line number
  const lines = groupBy(words, (word) => `Page${word.pageNumber}-Line${word.lineNumber}`);

  return lines;
};

export default groupLinesByVerses;
