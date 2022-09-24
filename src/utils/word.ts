/* eslint-disable import/prefer-default-export */
import { QuranFont } from 'types/QuranReader';
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

/**
 * Get the text field name based on the currently
 * selected quranFont.
 *
 * @param {QuranFont} quranFont
 * @returns {string}
 */
export const getWordTextFieldNameByFont = (quranFont: QuranFont): string => {
  switch (quranFont) {
    case QuranFont.IndoPak:
      return 'textIndopak';

    default:
      return 'textUthmani';
  }
};
