/* eslint-disable max-lines */
import { getChapterData } from './chapter';
import { PAGES_MUSHAF_MAP } from './page';
import { getVerseAndChapterNumbersFromKey } from './verse';
import { parseVerseRange } from './verseKeys';

import ChaptersData from 'types/ChaptersData';
import { Mushaf } from 'types/QuranReader';

export const MAX_AYAHS_LIMIT = 10;

/**
 * Validate a chapterId which can be in-valid in 2 cases:
 *
 * 1. if it's a string that is not numeric e.g. "test".
 * 2. if it's a numeric string but lies outside the range 1->114.
 *
 * @param {string} chapterId
 * @returns {boolean}
 */
export const isValidChapterId = (chapterId: string): boolean => {
  const chapterIdNumber = Number(chapterId);
  // if it's not a numeric string or it's numeric but out of the range of chapter 1->114
  if (Number.isNaN(chapterIdNumber) || chapterIdNumber > 114 || chapterIdNumber < 1) {
    return false;
  }
  return true;
};

/**
 * Check whether the verse number is valid by trying to convert it
 * into a number.
 *
 * @param {string} verseId
 * @returns {boolean}
 */
export const isValidVerseNumber = (verseId: string): boolean => {
  const verseIdNumber = Number(verseId);
  return !Number.isNaN(verseIdNumber);
};

/**
 * Validate a verseId which can be in-valid in 3 cases:
 *
 * 1. if it's a string that is not numeric e.g. "test".
 * 2. if it's a numeric string but below 1.
 * 3. if it's a numeric string but above the maximum number of verses for the chapter. e.g. verseId 8 for chapterId 1 (Alfatiha) is invalid since it only has 7 verses.
 *
 * @param {ChaptersData} chaptersData
 * @param {string} chapterId the chapter id. We will assume it's valid since we already validated it.
 * @param {string} verseId the verse id being validated.
 * @returns {boolean}
 */
export const isValidVerseId = (
  chaptersData: ChaptersData,
  chapterId: string,
  verseId: string,
): boolean => {
  const verseIdNumber = Number(verseId);
  // is not a valid number, below 1 or above the maximum number of verses for the chapter.
  if (Number.isNaN(verseIdNumber) || verseIdNumber < 1) {
    return false;
  }
  if (
    !getChapterData(chaptersData, chapterId) ||
    verseIdNumber > getChapterData(chaptersData, chapterId).versesCount
  ) {
    return false;
  }
  return true;
};

/**
 * Validate a juzId which can be in-valid in 2 cases:
 *
 * 1. if it's a string that is not numeric e.g. "test".
 * 2. if it's a numeric string but lies outside the range 1->30.
 *
 * @param {string} juzId
 * @returns {boolean}
 */
export const isValidJuzId = (juzId: string): boolean => {
  const juzIdNumber = Number(juzId);
  // if it's not a numeric string or it's numeric but out of the range of chapter 1->30
  if (Number.isNaN(juzIdNumber) || juzIdNumber > 30 || juzIdNumber < 1) {
    return false;
  }
  return true;
};

/**
 * Validate a rubId which can be in-valid in 2 cases:
 *
 * 1. if it's a string that is not numeric e.g. "test".
 * 2. if it's a numeric string but lies outside the range 1->240.
 *
 * @param {string} rubId
 * @returns {boolean}
 */
export const isValidRubId = (rubId: string): boolean => {
  const rubIdNumber = Number(rubId);
  // if it's not a numeric string or it's numeric but out of the range of chapter 1->240
  if (Number.isNaN(rubIdNumber) || rubIdNumber > 240 || rubIdNumber < 1) {
    return false;
  }
  return true;
};

/**
 * Validate a hizbId which can be in-valid in 2 cases:
 *
 * 1. if it's a string that is not numeric e.g. "test".
 * 2. if it's a numeric string but lies outside the range 1->60.
 *
 * @param {string} hizbId
 * @returns {boolean}
 */
export const isValidHizbId = (hizbId: string): boolean => {
  const hizbIdNumber = Number(hizbId);
  // if it's not a numeric string or it's numeric but out of the range of chapter 1->30
  if (Number.isNaN(hizbIdNumber) || hizbIdNumber > 60 || hizbIdNumber < 1) {
    return false;
  }
  return true;
};

/**
 * Validate a pageId which can be in-valid in 2 cases:
 *
 * 1. if it's a string that is not numeric e.g. "test".
 * 2. if it's a numeric string but lies outside the range of the selected Mushaf.
 *
 * @param {string | number} pageId
 * @returns {boolean}
 */
export const isValidPageNumber = (pageId: string | number, mushafId: Mushaf): boolean => {
  const pageIdNumber = Number(pageId);
  const MUSHAF_COUNT = PAGES_MUSHAF_MAP[mushafId];
  // if it's not a numeric string or it's numeric but out of the range of the selected Mushaf
  if (Number.isNaN(pageIdNumber) || pageIdNumber > MUSHAF_COUNT || pageIdNumber < 1) {
    return false;
  }
  return true;
};

/**
 * Extract the to and from verse by splitting the range by '-'.
 *
 * @param {string} range
 * @returns {string[]}
 */
export const getToAndFromFromRange = (range: string): string[] => range.split('-');

/**
 * This is to check if the range passed is valid or not. It won't be valid if:
 *
 * 1. The format is not a range's format and this is known if after splitting the range string
 *    by '-', we don't have 2 parts for the range representing the from verse and to verse.
 *    e.g. 'one'
 * 2. If after splitting them, either of the 2 parts are not a valid number e.g. 'one-two'
 *    or '1-two' or 'one-2'.
 * 3. If the from verse number exceeds the to verse number. e.g. '8-7'.
 * 4. If either the from verse number of to verse number exceeds the total number of verses
 *    for the current chapter e.g. for chapter 1: '7-8' or '8-8'.
 *
 * @param {ChaptersData} chaptersData
 * @param {string} chapterId
 * @param {string} range
 * @returns {boolean}
 */
export const isValidVerseRange = (
  chaptersData: ChaptersData,
  chapterId: string,
  range: string,
): boolean => {
  const rangeSplits = getToAndFromFromRange(range);
  // if the splits are not 2, it means it's not in the right format.
  if (rangeSplits.length !== 2) {
    return false;
  }
  const [from, to] = rangeSplits;
  const fromNumber = Number(from);
  const toNumber = Number(to);
  // if the range is in the right format but either value is not a number e.g. 'one-two'
  if (Number.isNaN(fromNumber) || Number.isNaN(toNumber)) {
    return false;
  }
  // 0 is not a valid verse number
  if (fromNumber === 0 || toNumber === 0) {
    return false;
  }
  // if the from verse number is bigger than the to verse number
  if (fromNumber > toNumber) {
    return false;
  }
  // if the chapterId is not a valid chapterId e.g. "word"
  if (!getChapterData(chaptersData, chapterId)) {
    return false;
  }
  const chapterVersesCount = getChapterData(chaptersData, chapterId).versesCount;
  // if either the from verse number of to verse number exceeds the chapter's total number.
  if (fromNumber > chapterVersesCount || toNumber > chapterVersesCount) {
    return false;
  }

  return true;
};

/**
 * Check if a string range is valid or not.
 * A valid range looks like this: "1:1-1:2" or "1:1-2:3".
 *
 * @param {ChaptersData} chaptersData
 * @param {string} rangesString
 * @returns {boolean}
 */
export const isRangesStringValid = (chaptersData: ChaptersData, rangesString: string): boolean => {
  const parsedVerseRange = parseVerseRange(rangesString);
  // 1. if the range is not in the right format
  if (!parsedVerseRange) {
    return false;
  }
  const [fromRange, toRange] = parsedVerseRange;
  // if both ranges are in the same chapter
  if (fromRange.chapter === toRange.chapter) {
    const verseRange = `${fromRange.verse}-${toRange.verse}`;
    // 2. if range within same surah is not valid
    if (!isValidVerseRange(chaptersData, fromRange.chapter, verseRange)) {
      return false;
    }
  } else {
    // 2. if start of range verse key is not valid
    if (!isValidVerseKey(chaptersData, fromRange.verseKey)) {
      return false;
    }
    // 3. if end of range verse key is not valid
    if (!isValidVerseKey(chaptersData, toRange.verseKey)) {
      return false;
    }
    // 4. if the fromRange chapter is bigger than the toRange chapter e.g. 2:1-1:1
    if (Number(fromRange.chapter) > Number(toRange.chapter)) {
      return false;
    }
  }

  return true;
};

/**
 * Check if a verse key is valid. An invalid verse key can be:
 *
 * 1. it's in a wrong format e.g. "verseKey"
 * 2. if the number of parts is bigger than 2 e.g. "1:2:3"
 * 3. if it's not a valid chapter id {@see isValidChapterId}
 * 4. if it's not a valid verse ID {@see isValidVerseId}
 *
 * @param {ChaptersData} chaptersData
 * @param {string} verseKey
 * @returns {boolean}
 */
export const isValidVerseKey = (chaptersData: ChaptersData, verseKey: string): boolean => {
  const splits = verseKey.split(':');
  // if the splits are not 2, it means it's not in the right format.
  if (splits.length !== 2) {
    return false;
  }
  const [chapterId, verseId] = splits;
  // if either value is not a number e.g. 'one:2' or if the verseNumber is below 0
  if (!isValidChapterId(chapterId) || !isValidVerseId(chaptersData, chapterId, verseId)) {
    return false;
  }

  return true;
};

/**
 * Check if a start verse key is valid. An invalid verse key can be:
 *
 * 1. if the verse number bigger than the surah's verses count
 * 2. if the verse from or verse to not matching the surah
 * 3. if the verse from and verse to has bigger than 10 ayahs difference
 *
 * @param {string} startVerseKey
 * @param {string} endVerseKey
 * @param {number} versesCount
 * @param {string} chapterID
 * @returns {boolean}
 */
export const isValidVerseFrom = (
  startVerseKey: string,
  endVerseKey: string,
  versesCount: number,
  chapterID: string,
): boolean => {
  const [startSurah, startVerse] = getVerseAndChapterNumbersFromKey(startVerseKey);
  const [endSurah, endVerse] = getVerseAndChapterNumbersFromKey(endVerseKey);

  const startVerseNumber = Number(startVerse);
  const endVerseNumber = Number(endVerse);
  const startSurahNumber = Number(startSurah);
  const endSurahNumber = Number(endSurah);

  if (startSurahNumber !== endSurahNumber) {
    return false;
  }

  if (startVerseNumber > versesCount) {
    return false;
  }
  if (startSurahNumber !== Number(chapterID)) {
    return false;
  }
  if (endVerseNumber - startVerseNumber >= MAX_AYAHS_LIMIT) {
    return false;
  }
  return true;
};

/**
 * Check if a end verse key is valid. An invalid verse key can be:
 * 1. if the ending verse number bigger than the surah's verses count
 * 2. if the ending verse number smaller than the starting verse
 * 3. if the verse from or verse to not matching the surah
 * 4. if the verse from and verse to has bigger than 10 ayahs difference
 *
 * @param {string} startVerseKey
 * @param {string} endVerseKey
 * @param {number} versesCount
 * @param {string} chapterID
 * @returns {boolean}
 */
export const isValidVerseTo = (
  startVerseKey: string,
  endVerseKey: string,
  versesCount: number,
  chapterID: string,
): boolean => {
  const [startSurah, startVerse] = getVerseAndChapterNumbersFromKey(startVerseKey);
  const [endSurah, endVerse] = getVerseAndChapterNumbersFromKey(endVerseKey);

  const startVerseNumber = Number(startVerse);
  const endVerseNumber = Number(endVerse);
  const startSurahNumber = Number(startSurah);
  const endSurahNumber = Number(endSurah);

  if (startSurahNumber !== endSurahNumber) {
    return false;
  }

  if (endVerseNumber > versesCount) {
    return false;
  }
  if (endVerseNumber < startVerseNumber) {
    return false;
  }
  if (endSurahNumber !== Number(chapterID)) {
    return false;
  }
  if (endVerseNumber - startVerseNumber >= MAX_AYAHS_LIMIT) {
    return false;
  }
  return true;
};

/**
 * Check whether a tafsir id is valid or not. An invalid tafsirId can be:
 * 1. A non numeric value.
 * 2. A numeric value that is less than 0.
 *
 * @param {string} tafsirId
 * @returns {boolean}
 */
export const isValidTafsirId = (tafsirId: string): boolean => {
  const tafsirIdNumber = Number(tafsirId);
  // if the tafsir Id is not a number of if it's below 1
  if (Number.isNaN(tafsirIdNumber) || tafsirIdNumber < 1) {
    return false;
  }
  return true;
};
