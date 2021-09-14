import range from 'lodash/range';
import * as sampleVerse from './sample-verse.json';
import { getAllChaptersData } from './chapter';

const COLON_SPLITTER = ':';

/**
 * This will generate all the keys for the verses of a chapter. a key is `{chapterId}:{verseId}`.
 *
 * @param {string} chapterId
 * @returns {string[]}
 */
export const generateChapterVersesKeys = (chapterId: string): string[] => {
  const data = getAllChaptersData();

  return range(data[chapterId].versesCount).map((verseId) => `${chapterId}:${verseId + 1}`);
};

/**
 * Get the chapter number from its key. A key is the combination between the verse's chapter
 * and its number separated by ":" e.g. 1:5.
 *
 * @param {string} verseKey
 * @returns {Number} The verse number extracted from the key.
 */
export const getChapterNumberFromKey = (verseKey: string): number =>
  Number(verseKey.split(COLON_SPLITTER)[0]);

/**
 * Get the verse number from its key. A key is the combination between the verse's chapter
 * and its number separated by ":" e.g. 1:5.
 *
 * @param {string} verseKey
 * @returns {Number} The verse number extracted from the key.
 */
export const getVerseNumberFromKey = (verseKey: string): number =>
  Number(verseKey.split(COLON_SPLITTER)[1]);

/**
 * Get the chapter and verse number of a verse from its key.
 *
 * @param {string} verseKey
 * @returns {[String, String]} The verse number extracted from the key.
 */
export const getVerseAndChapterNumbersFromKey = (verseKey: string): [string, string] => {
  const splits = verseKey.split(COLON_SPLITTER);
  return [splits[0], splits[1]];
};

/**
 * Split the word's location and get the surahNumber, verseNumber and wordNumber.
 *
 * @param {String} wordLocation the word location {surahNumber}:{verseNumber}:{wordNumber}
 * @returns {[String, String, String]}
 */
export const getWordDataByLocation = (wordLocation: string): [string, string, string] => {
  const locationSplits = wordLocation.split(COLON_SPLITTER);
  return [locationSplits[0], locationSplits[1], locationSplits[2]];
};

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
export const getFirstWordOfSurah = (
  wordLocation: string,
): { chapterId: string; isFirstWordOfSurah: boolean } => {
  const locationSplits = getWordDataByLocation(wordLocation);
  return {
    chapterId: locationSplits[0],
    isFirstWordOfSurah: locationSplits[1] === '1' && locationSplits[2] === '1',
  };
};

/**
 * get sample verse data
 * it currently return 2:5 (Al baqarah verse 5)
 * @returns {Verse} verse
 */
export const getSampleVerse = () => sampleVerse;

/**
 * sort the the word location of the verses
 *
 * @param {string[]} locations , the location of the word, Example ['1:1:2', '1:1:1', '1:3:1]
 * @returns {number} sortedLocations , Example ['1:1:1', '1:1:2', '1:3:1']
 *
 * Reference: https://gomakethings.com/sorting-an-array-by-multiple-criteria-with-vanilla-javascript/
 */
export const sortWordLocation = (locations: string[]) =>
  locations.sort((a, b) => {
    const [aChapter, aVerse, aWord] = a.split(':');
    const [bChapter, bVerse, bWord] = b.split(':');

    if (Number(aChapter) > Number(bChapter)) return 1;
    if (Number(aChapter) < Number(bChapter)) return -1;

    if (Number(aVerse) > Number(bVerse)) return 1;
    if (Number(aVerse) < Number(bVerse)) return -1;

    if (Number(aWord) > Number(bWord)) return 1;
    if (Number(aWord) < Number(bWord)) return -1;

    return 0;
  });

/**
 * Format chapter id, add prefix '0' if it's a single digit number
 *
 * @param {string} id chapter id
 * @returns {string} formattedChapterId
 *
 * @example
 * // returns '01'
 * formatChapterId('1')
 * @example
 * // returns '102'
 * formatChapterId('102')
 */
export const formatChapterId = (id: string) => `0${id}`.slice(-2);

/**
 * Given the chapterId, return the url for that chapter info
 * @param {string} chapterId
 * @returns {string} chapterUrl
 */
export const getChapterInfoUrl = (chapterId: string) => `/${chapterId}/info`;

/**
 * Given the verseKey, return the verseUrl
 *
 * @param {string} verseKey, example: "1:5"
 * @returns {string} verseUrl , example "/1/5";
 */
export const getVerseUrl = (verseKey: string): string => {
  const [chapterNumber, verseNumber] = getVerseAndChapterNumbersFromKey(verseKey);
  return `/${chapterNumber}/${verseNumber}`;
};
