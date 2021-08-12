import range from 'lodash/range';
import * as chaptersData from '../../data/chapters.json';

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
export const getChapterNumberFromKey = (verseKey: string): number => Number(verseKey.split(':')[0]);

/**
 * Get the verse number for its key. A key is the combination between the verse's chapter
 * and its number separated by ":" e.g. 1:5.
 *
 * @param {string} verseKey
 * @returns {Number} The verse number extracted from the key.
 */
export const getVerseNumberFromKey = (verseKey: string): number => Number(verseKey.split(':')[1]);
