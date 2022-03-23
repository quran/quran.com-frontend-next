/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable import/prefer-default-export */
import range from 'lodash/range';

import { getChapterData } from './chapter';

import ChaptersData from 'types/ChaptersData';

/**
 * Generate the verse keys between two verse keys.
 *
 * @param {ChaptersData} chaptersData
 * @param {string} fromVerseKey
 * @param {string} toVerseKey
 * @returns {string[]}
 */
export const generateVerseKeysBetweenTwoVerseKeys = (
  chaptersData: ChaptersData,
  fromVerseKey: string,
  toVerseKey: string,
): string[] => {
  const verseKeys = [];
  const [startChapter, startVerse] = fromVerseKey.split(':');
  const [endChapter, endVerse] = toVerseKey.split(':');
  if (startChapter === endChapter) {
    range(Number(startVerse), Number(endVerse) + 1).forEach((verseNumber) => {
      verseKeys.push(`${startChapter}:${verseNumber}`);
    });
  } else {
    range(Number(startChapter), Number(endChapter) + 1).forEach((chapterNumber) => {
      if (chapterNumber === Number(startChapter)) {
        const chapterData = getChapterData(chaptersData, startChapter);
        range(Number(startVerse), chapterData.versesCount + 1).forEach((verseNumber) => {
          verseKeys.push(`${startChapter}:${verseNumber}`);
        });
      } else if (chapterNumber === Number(endChapter)) {
        range(1, Number(endVerse) + 1).forEach((verseNumber) => {
          verseKeys.push(`${endChapter}:${verseNumber}`);
        });
      } else {
        const chapterData = getChapterData(chaptersData, String(chapterNumber));
        range(1, chapterData.versesCount + 1).forEach((verseNumber) => {
          verseKeys.push(`${chapterNumber}:${verseNumber}`);
        });
      }
    });
  }

  return verseKeys;
};
