/* eslint-disable import/prefer-default-export */
import Verse from 'types/Verse';
import { CharType } from 'types/Word';

/**
 * Construct the verse text given an array of words.
 *
 * @param {Verse} verse
 * @returns {string}
 */
export const getVerseTextByWords = (verse: Verse): string => {
  let verseText = '';
  verse.words.forEach((word) => {
    if (word.charTypeName !== CharType.End) {
      verseText = `${verseText} ${word.text}`;
    }
  });
  return verseText;
};
