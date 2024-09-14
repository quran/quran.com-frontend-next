/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import range from 'lodash/range';

import { getChapterData } from './chapter';
import { formatStringNumber } from './number';
import { parseVerseRange } from './verseKeys';

import ChaptersData from 'types/ChaptersData';
import Verse from 'types/Verse';
import Word from 'types/Word';

const COLON_SPLITTER = ':';

/**
 * This will generate all the keys for the verses of a chapter. a key is `{chapterId}:{verseId}`.
 *
 * @param {ChaptersData} data
 * @param {string} chapterId
 * @param {boolean} hideChapterId
 * @returns {string[]}
 */
export const generateChapterVersesKeys = (
  data: ChaptersData,
  chapterId: string,
  hideChapterId?: boolean,
): string[] => {
  const chapterNumberString = formatStringNumber(chapterId);
  return range(data[chapterNumberString]?.versesCount).map((verseId) =>
    hideChapterId ? `${verseId + 1}` : `${chapterNumberString}:${verseId + 1}`,
  );
};

/**
 * Get the chapter number from its key. A key is the combination between the verse's chapter
 * and its number separated by ":" e.g. 1:5.
 *
 * @param {string} verseKey
 * @returns {number} The verse number extracted from the key.
 */
export const getChapterNumberFromKey = (verseKey: string): number =>
  Number(verseKey.split(COLON_SPLITTER)[0]);

/**
 * Get the verse number from its key. A key is the combination between the verse's chapter
 * and its number separated by ":" e.g. 1:5.
 *
 * @param {string} verseKey
 * @returns {number} The verse number extracted from the key.
 */
export const getVerseNumberFromKey = (verseKey: string): number =>
  Number(verseKey.split(COLON_SPLITTER)[1]);

/**
 * If the verse is a range of verses, for example 1:3-5
 * we'll return {surah: 1, from: 3, to: 5}
 *
 * @param {string} verseKey
 * @returns {surah: number, from: Number, to: Number}
 */
export const getVerseNumberRangeFromKey = (
  verseKey: string,
): { surah: number; from: number; to: number } => {
  const splits = verseKey.split(COLON_SPLITTER);
  const surahNumber = splits[0];
  const verseNumber = splits[1]; // for example (3-5)
  const [from, to] = verseNumber.split('-'); // for example [3, 5]
  return { surah: Number(surahNumber), from: Number(from), to: to ? Number(to) : Number(from) };
};

/**
 * Get the chapter and verse number of a verse from its key.
 *
 * @param {string} verseKey
 * @returns {[string, string]} The verse number extracted from the key.
 */
export const getVerseAndChapterNumbersFromKey = (verseKey: string): [string, string] => {
  const splits = verseKey.split(COLON_SPLITTER);
  return [splits[0], splits[1]];
};

/**
 * Split the word's location and get the surahNumber, verseNumber and wordNumber.
 *
 * @param {string} wordLocation the word location {surahNumber}:{verseNumber}:{wordNumber}
 * @returns {[string, string, string]}
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
 * @returns {{ chapterId: string; isFirstWordOfSurah: boolean }}
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
 * Given the verseKey, return the verseUrl
 *
 * @param {string} verseKey example: "1:5"
 * @returns {string} verseUrl , example "/1/5";
 */
export const getVerseUrl = (verseKey: string): string => {
  const [chapterNumber, verseNumber] = getVerseAndChapterNumbersFromKey(verseKey);
  return `/${chapterNumber}/${verseNumber}`;
};

/**
 * This is a sorting function that is meant to be used with array.sort() function
 * to sort a list of verse keys to match their appearance in the Mushaf.
 *
 * @param {string} verseKey1
 * @param {string} verseKey2
 * @returns {number}
 */
export const sortByVerseKey = (verseKey1: string, verseKey2: string): number => {
  const [chapterId1, verseId1] = getVerseAndChapterNumbersFromKey(verseKey1);
  const [chapterId2, verseId2] = getVerseAndChapterNumbersFromKey(verseKey2);
  const chapterId1Number = Number(chapterId1);
  const chapterId2Number = Number(chapterId2);
  const verseId1Number = Number(verseId1);
  const verseId2Number = Number(verseId2);
  if (chapterId1Number > chapterId2Number) {
    return 1;
  }
  if (chapterId1Number < chapterId2Number) {
    return -1;
  }
  return verseId1Number > verseId2Number ? 1 : -1;
};

/**
 * Sort an object by keys whose keys are verse keys.
 *
 * @param {Record<string, unknown>} object
 * @returns {Record<string, unknown>}
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sortVersesObjectByVerseKeys = (object: Record<string, any>): Record<string, any> => {
  const sortedObject = {};
  Object.keys(object)
    .sort((verseKey1, verseKey2) => sortByVerseKey(verseKey1, verseKey2))
    .forEach((verseKey) => {
      sortedObject[verseKey] = object[verseKey];
    });
  return sortedObject;
};

/**
 * make verseKey from chapterNumber and verseNumber, example "1:5"
 *
 * @param {number|string} chapterNumber
 * @param {number|string} verseNumberOrRangeFrom
 * @param {number|string} rangeTo
 * @returns {string}
 */
export const makeVerseKey = (
  chapterNumber: number | string,
  verseNumberOrRangeFrom: number | string,
  rangeTo?: number | string,
): string => {
  if (rangeTo && verseNumberOrRangeFrom !== rangeTo) {
    return `${chapterNumber}:${verseNumberOrRangeFrom}-${rangeTo}`;
  }

  return `${chapterNumber}:${verseNumberOrRangeFrom}`;
};

/**
 * make wordLocation from verseKey and wordPosition, example "1:1:2"
 *
 * @param {string} verseKey
 * @param {string} wordPosition
 * @returns {string} wordLocation
 */
export const makeWordLocation = (verseKey: string, wordPosition: number): string =>
  `${verseKey}:${wordPosition}`;

/**
 * Get the words of each verse. This can be used to extend
 * the BE response of each word to add custom fields.
 *
 * @param {Verse} verse
 * @param {boolean} isReadingView
 * @returns {Word[]}
 */
export const getVerseWords = (verse: Verse, isReadingView = false): Word[] => {
  const words = [];
  verse.words.forEach((word) => {
    const wordVerse = { ...verse };
    words.push({
      ...word,
      hizbNumber: verse.hizbNumber,
      ...(isReadingView && { verse: wordVerse }),
    });
  });
  return words;
};

/**
 * Calculate the number of verses in a range of chapters.
 *
 * @param {ChaptersData} chaptersData
 * @param {number} startChapter
 * @param {number} endChapter
 * @returns {number}
 */
const getNumberOfVersesInRangeOfChapters = (
  chaptersData: ChaptersData,
  startChapter: number,
  endChapter: number,
): number => {
  let total = 0;
  for (let currentChapterId = startChapter; currentChapterId < endChapter; currentChapterId += 1) {
    total += getChapterData(chaptersData, String(currentChapterId)).versesCount;
  }
  return total;
};

/**
 * Calculate how far apart 2 verses are from each other. The order of the verses
 * won't matter as we swap them if they are not in the same order of the Mushaf.
 *
 * @param {ChaptersData} chaptersData
 * @param {string} firstVerseKey
 * @param {string} secondVerseKey
 *
 * @returns {number}
 */
export const getDistanceBetweenVerses = (
  chaptersData: ChaptersData,
  firstVerseKey: string,
  secondVerseKey: string,
): number => {
  // eslint-disable-next-line prefer-const
  let [firstChapterString, firstVerseNumberString] =
    getVerseAndChapterNumbersFromKey(firstVerseKey);
  const [secondChapterString, secondVerseNumberString] =
    getVerseAndChapterNumbersFromKey(secondVerseKey);
  let firstChapterNumber = Number(firstChapterString);
  let secondChapterNumber = Number(secondChapterString);
  let firstVerseNumber = Number(firstVerseNumberString);
  let secondVerseNumber = Number(secondVerseNumberString);
  // if they are within the same chapter
  if (firstChapterNumber === secondChapterNumber) {
    if (firstVerseNumber > secondVerseNumber) {
      return firstVerseNumber - secondVerseNumber;
    }
    return secondVerseNumber - firstVerseNumber;
  }
  // if the first verse chapter is after the second, we swap them to match the same order in the Mushaf
  if (firstChapterNumber > secondChapterNumber) {
    [
      firstVerseNumber,
      secondVerseNumber,
      firstChapterNumber,
      secondChapterNumber,
      firstChapterString,
    ] = [
      secondVerseNumber,
      firstVerseNumber,
      secondChapterNumber,
      firstChapterNumber,
      secondChapterString,
    ];
  }
  let distance = 0;
  // if there is more than 1 full chapter in between the verses' chapters being checked, we sum the number of verses in each chapter.
  if (secondChapterNumber - firstChapterNumber > 1) {
    distance += getNumberOfVersesInRangeOfChapters(
      chaptersData,
      firstChapterNumber + 1,
      secondChapterNumber,
    );
  }
  /*
    1. we add the number of verses from beginning of the second verse's chapter -> the verse itself.
    2. we add the difference between the last verse of the first verse's chapter and the first verse itself.
  */
  return (
    distance +
    secondVerseNumber +
    getChapterData(chaptersData, firstChapterString).versesCount -
    firstVerseNumber
  );
};

/**
 * Whether the current verse is the first in surah.
 *
 * @param {number} verseNumber
 * @returns {boolean}
 */
export const isFirstVerseOfSurah = (verseNumber: number): boolean => verseNumber === 1;

/**
 * Whether the current verse is the last in surah.
 *
 * @param {ChaptersData} chaptersData
 * @param {string} chapterNumber
 * @param {number} verseNumber
 * @returns {boolean}
 */
export const isLastVerseOfSurah = (
  chaptersData: ChaptersData,
  chapterNumber: string,
  verseNumber: number,
): boolean => verseNumber === getChapterData(chaptersData, chapterNumber).versesCount;

export const getChapterFirstAndLastVerseKey = (chaptersData: ChaptersData, chapterId: string) => {
  if (!chaptersData) {
    return ['', ''];
  }
  const chapterData = getChapterData(chaptersData, chapterId);
  return [
    makeVerseKey(Number(chapterId), 1),
    makeVerseKey(Number(chapterId), chapterData.versesCount),
  ];
};

/**
 * Shorten a text by setting the maximum number of characters
 * by the value of the parameter and adding "..." at the end.
 *
 * @param {string} text
 * @param {number} length
 * @returns {string}
 */
export const shortenVerseText = (text: string, length = 150): string => {
  const characters = text.split('', length);
  let shortenedText = '';
  for (let index = 0; index < characters.length; index += 1) {
    const character = characters[index];
    if (shortenedText.length === length - 1) {
      shortenedText = `${shortenedText}${character}...`;
      break;
    }
    shortenedText = `${shortenedText}${character}`;
  }
  return shortenedText;
};

/**
 * Given list of verses, get all the first and the last verseKeys
 *
 * @param {Record<string, Verse>} verses
 * @returns {string[]} [firstVerseKey, lastVerseKey]
 */
export const getFirstAndLastVerseKeys = (verses: Record<string, Verse>): string[] => {
  const verseKeys = Object.keys(verses).sort(sortByVerseKey);
  return [verseKeys[0], verseKeys[verseKeys.length - 1]];
};

/**
 * This function checks if a verse key is within a range or an array of ranges.
 *
 * Examples:
 * - `isVerseKeyWithinRanges('1:1', '1:1-1:7')` -> `true`
 * - `isVerseKeyWithinRanges('1:1', '1:2-1:7')` -> `false`
 * - `isVerseKeyWithinRanges('2:4', ['1:1-1:7', '2:1-2:5'])` -> `true`
 * - `isVerseKeyWithinRanges('2:10', ['1:2-1:7', '2:1-2:5'])` -> `false`
 *
 * @param {string} verseKey - verse key, e.g. 1:1
 * @param {string[] | string} ranges - verse range or array of verse ranges, e.g. `1:1-1:7` or `['1:1-1:7', '2:1-2:5']`
 * @returns {boolean}
 */
export const isVerseKeyWithinRanges = (verseKey: string, ranges: string[] | string) => {
  const [chapter, verse] = getVerseAndChapterNumbersFromKey(verseKey).map(Number);
  const rangesArray = Array.isArray(ranges) ? ranges : [ranges];

  for (let i = 0; i < rangesArray.length; i += 1) {
    const verseRange = rangesArray[i];
    const [from, to] = parseVerseRange(verseRange, true);

    // if the chapter is less than or greater than the range, then skip this range
    if (chapter < from.chapter || chapter > to.chapter) {
      // eslint-disable-next-line no-continue
      continue;
    }

    // if the chapter is equal to the chapter of the range start, then check if the verse is within the range
    // if the verse is less than the range, then skip this range
    if (chapter === from.chapter && verse < from.verse) {
      // eslint-disable-next-line no-continue
      continue;
    }

    // if the chapter is equal to the chapter of the range end, then check if the verse is within the range
    // if the verse is greater than the range, then skip this range
    if (chapter === to.chapter && verse > to.verse) {
      // eslint-disable-next-line no-continue
      continue;
    }

    // if we're here, it means that the verse is within the range
    // so we can return true directly and end the loop
    return true;
  }

  // if we're here, it means that the verse is not within any of the ranges
  // so we can return false
  return false;
};
