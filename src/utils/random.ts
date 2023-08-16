/* eslint-disable react-func/max-lines-per-function */
import random from 'lodash/random';

import { formatChapter } from './chapter';
import { formatChapterVerse } from './verse';

import ChaptersData from '@/types/ChaptersData';

export const QURAN_CHAPTERS_COUNT = 114;

//  TODO replace Array<Record<string, unknown>> with proper typing for recentReadingSessions
/**
 * Randomly picks a surah from the 114 surahs in the Quran.
 *
 * @param {Array<Record<string, unknown>>} surahs - An optional array of surahs to pick from.
 * @returns {string} The surah number.
 */
export const getRandomSurahId = (surahs?: Array<Record<string, unknown>>): string => {
  if (!surahs) return random(1, QURAN_CHAPTERS_COUNT).toString();
  return surahs[random(0, surahs.length - 1)].id;
};

/**
 * Randomly picks an ayah from the given surah.
 *
 * @param {ChaptersData} data - The chapter data given from the ReactContext.
 * @param {string} surah - The surah to pick from.
 * @param {number} max - The furthest verse to choose between.
 * @returns {string} The verse key.
 */
export const getRandomAyahId = (data: ChaptersData, surah: string, max?: number): string => {
  return random(1, Math.min(max || 999, data[surah].versesCount)).toString();
};

/**
 * Randomly picks an ayah from any surah, or any of the given surahs if provided.
 *
 * @param {ChaptersData} data - The chapter data given from the ReactContext.
 * @param {Array<Record<string, unknown>>} surahs - The surah to pick from.
 * @returns {string} The surah and verse key.
 */
export const getRandomSurahAyahId = (
  data: ChaptersData,
  surahs?: Array<Record<string, unknown>>,
): string => {
  if (!surahs) {
    const surahId = getRandomSurahId(surahs);
    const ayahId = getRandomAyahId(data, surahId);
    return `${surahId}:${ayahId}`;
  }
  const randomIndex = random(0, surahs.length - 1);
  const { id: surahId, lastRead } = surahs[randomIndex];
  const ayahId = getRandomAyahId(data, surahId, lastRead);
  return `${surahId}:${ayahId}`;
};

export const getRandomAll = (data: ChaptersData, verse: string) => {
  //  TODO replace this with dynamic list of read surahs and ayahs
  const surahs = [
    {
      id: '1',
      lastRead: '5',
    },
    {
      id: '5',
      lastRead: '64',
    },
    {
      id: '114',
      lastRead: '6',
    },
    {
      id: '51',
      lastRead: '30',
    },
    {
      id: '64',
      lastRead: '14',
    },
    {
      id: '89',
      lastRead: '30',
    },
  ];

  const randomSurahId = getRandomSurahId();
  const randomSurahAyahId = getRandomSurahAyahId(data);
  const randomReadSurahId = getRandomSurahId(surahs);
  const randomReadSurahAyahId = getRandomSurahAyahId(data, surahs);

  const randomSurah = formatChapter(data, randomSurahId);
  const randomSurahAyah = formatChapterVerse(data, randomSurahAyahId, verse);

  const randomReadSurah = formatChapter(data, randomReadSurahId);
  const randomReadSurahAyah = formatChapterVerse(data, randomReadSurahAyahId, verse);

  return [
    randomSurahId,
    randomSurahAyahId,
    randomReadSurahId,
    randomReadSurahAyahId,

    randomSurah,
    randomSurahAyah,
    randomReadSurah,
    randomReadSurahAyah,
  ];
};
