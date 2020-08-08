import _ from 'lodash';
import WordType from 'types/WordType';

/**
 * Splits the words on the line by verse.
 * output:
 * {
 *  06:01 (versekey): [words],
 *  06:02 (versekey): [words]
 *  ...
 * }
 */
const groupVersesByLine = (line: WordType[]) => {
  const verses = _.groupBy(line, (word) => {
    return word.verseKey;
  });

  return verses;
};

export default groupVersesByLine;
