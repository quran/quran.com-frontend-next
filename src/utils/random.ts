/* eslint-disable react-func/max-lines-per-function */
import random from 'lodash/random';
import sample from 'lodash/sample';

import { formatChapter } from './chapter';
import { formatChapterVerse } from './verse';

import { SurahLogs } from '@/redux/slices/QuranReader/readingTracker';
import ChaptersData from '@/types/ChaptersData';

export const QURAN_CHAPTERS_COUNT = 114;

/**
 * Randomly picks a surah from the 114 surahs in the Quran.
 *
 * @param {SurahLogs} surahs - An optional array of surahs to pick from.
 * @returns {string} The surah number.
 */
export const getRandomSurahId = (surahs?: SurahLogs): string => {
  if (!surahs) return random(1, QURAN_CHAPTERS_COUNT).toString();
  return sample(Object.keys(surahs));
};

/**
 * Randomly picks an ayah from the given surah.
 *
 * @param {ChaptersData} data - The chapter data given from the ReactContext.
 * @param {string} surah - The surah to pick from.
 * @param {string} max - The furthest verse to choose between.
 * @returns {string} The verse key.
 */
export const getRandomAyahId = (data: ChaptersData, surah: string, max?: string): string => {
  return random(1, Math.min(parseInt(max, 10) || 999, data[surah].versesCount)).toString();
};

/**
 * Randomly picks an ayah from any surah, or any of the given surahs if provided.
 *
 * @param {ChaptersData} data - The chapter data given from the ReactContext.
 * @param {SurahLogs} surahs - The surah to pick from.
 * @returns {string} The surah and verse key.
 */
export const getRandomSurahAyahId = (data: ChaptersData, surahs?: SurahLogs): string => {
  if (!surahs) {
    const surahId = getRandomSurahId(surahs);
    const ayahId = getRandomAyahId(data, surahId);
    return `${surahId}:${ayahId}`;
  }
  const { chapterId, lastRead } = sample(Object.values(surahs));
  const ayahId = getRandomAyahId(data, chapterId, lastRead);
  return `${chapterId}:${ayahId}`;
};

/**
 * Returns a random surah and verse key from both read and unread surahs.
 *
 * Note this function is only meant to be called to generate the menu items used to navigate to a random surah and verse.
 *
 * @param {ChaptersData} data - The chapter data given from the ReactContext.
 * @param {SurahLogs} surahs - The surah to pick from.
 * @param {string} verseString - verse string in the user's locale, for example "verse" in english or "آية" in arabic.
 * @returns {Record<string, string>} an object containing the random surahs and verses.
 */
export const getRandomAll = (
  data: ChaptersData,
  surahs: SurahLogs,
  verseString: string,
): Record<string, string> => {
  const randomSurahId = getRandomSurahId();
  const randomSurahAyahId = getRandomSurahAyahId(data);

  const randomSurah = formatChapter(data, randomSurahId);
  const randomSurahAyah = formatChapterVerse(data, randomSurahAyahId, verseString);

  if (surahs && Object.keys(surahs).length > 0) {
    const randomReadSurahId = getRandomSurahId(surahs);
    const randomReadSurahAyahId = getRandomSurahAyahId(data, surahs);
    const randomReadSurah = formatChapter(data, randomReadSurahId);
    const randomReadSurahAyah = formatChapterVerse(data, randomReadSurahAyahId, verseString);

    return {
      randomSurahId,
      randomSurahAyahId,
      randomSurah,
      randomSurahAyah,

      randomReadSurahId,
      randomReadSurahAyahId,
      randomReadSurah,
      randomReadSurahAyah,
    };
  }

  return {
    randomSurahId,
    randomSurahAyahId,
    randomSurah,
    randomSurahAyah,
  };
};
