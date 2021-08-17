import range from 'lodash/range';
import * as chaptersData from '../../data/chapters.json';

const COLON_SPLITTER = ':';

/**
 * This will generate all the keys for the verses of a chapter. a key is `{chapterId}:{verseId}`.
 *
 * @param {string} chapterId
 * @returns {string[]}
 */
export const generateChapterVersesKeys = (chapterId: string): string[] =>
  range(chaptersData[chapterId].versesCount).map((verseId) => `${chapterId}:${verseId + 1}`);

/**
 * Get the chapter number for its key. A key is the combination between the verse's chapter
 * and its number separated by ":" e.g. 1:5.
 *
 * @param {string} verseKey
 * @returns {Number} The verse number extracted from the key.
 */
export const getChapterNumberFromKey = (verseKey: string): number =>
  Number(verseKey.split(COLON_SPLITTER)[0]);

/**
 * Get the verse number for its key. A key is the combination between the verse's chapter
 * and its number separated by ":" e.g. 1:5.
 *
 * @param {string} verseKey
 * @returns {Number} The verse number extracted from the key.
 */
export const getVerseNumberFromKey = (verseKey: string): number =>
  Number(verseKey.split(COLON_SPLITTER)[1]);

/**
 * Extract the data related to a word. The first is the chapter Id,
 * the second is whether the word is the first word of the first verse
 * of the Surah. To do that we will have to split the word location
 * which comes in the following format: {surahNumber}:{verseNumber}:{wordNumber}.
 * For this to be true, the combination of {verseNumber}:{wordNumber} has to be
 * 1:1.
 *
 * @param {string} wordLocation whose format is {surahNumber}:{verseNumber}:{wordNumber} e.g. "112:1:1"
 */
export const getWordDataFromLocation = (
  wordLocation: string,
): { chapterId: string; isFirstWordOfFirstVerseOfSurah: boolean } => {
  const locationSplits = wordLocation.split(COLON_SPLITTER);
  return {
    chapterId: locationSplits[0],
    isFirstWordOfFirstVerseOfSurah: locationSplits[1] === '1' && locationSplits[2] === '1',
  };
};
