import _ from 'lodash';
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
 */
const groupLinesByVerses = (verses: Verse[]) => {
  const words = [] as Word[];

  // Flattens the verses into an array of words
  verses.forEach((verse) => {
    let initialWordLine = verse.words[0].lineNumber;
    for (let index = 0; index < verse.words.length; index += 1) {
      const word = verse.words[index];
      // it means the current word although it belongs to the current verse, but in the physical mushaf, it's on another line
      if (word.lineNumber > initialWordLine) {
        words.push({
          ...word,
          isAfterLineBreak: true,
        });
        // we need this in-case the verse spans across multiple lines
        initialWordLine = word.lineNumber;
      } else {
        words.push(word);
      }
    }
  });

  // Groups the words based on their (page and) line number
  return _.groupBy(words, (word) => `Verse${word.verseKey}`);
};

export default groupLinesByVerses;
