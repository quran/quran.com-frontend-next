import { QuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import Verse from 'types/Verse';
import Word from 'types/Word';

/**
 * If the number of translations has changed between 2 renders it's due to the
 * user choosing/un-choosing a translation.
 *
 * @param {Verse} prevVerse
 * @param {Verse} nextVerse
 * @returns {boolean}
 */
export const verseTranslationChanged = (prevVerse: Verse, nextVerse: Verse): boolean =>
  prevVerse?.translations?.length !== nextVerse?.translations?.length;

/**
 * Check whether the font has changed or not between 2 renders. We consider the font
 * has changed also when the number of lines in indopak has changed.
 *
 * @param {QuranReaderStyles} prevQuranStyles
 * @param {QuranReaderStyles} nextQuranStyles
 * @param {Word[]} prevWords
 * @param {Word[]} nextWords
 * @returns {boolean}
 */
export const verseFontChanged = (
  prevQuranStyles: QuranReaderStyles,
  nextQuranStyles: QuranReaderStyles,
  prevWords: Word[],
  nextWords: Word[],
): boolean =>
  prevQuranStyles.mushafLines !== nextQuranStyles.mushafLines ||
  prevWords.length !== nextWords.length ||
  prevWords[0].text !== nextWords[0].text;
