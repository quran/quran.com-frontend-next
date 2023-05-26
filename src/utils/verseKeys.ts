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

type VerseRangeInfo<T> = [
  // from
  {
    chapter: T;
    verse: T;
    verseKey: string;
  },
  // to
  {
    chapter: T;
    verse: T;
    verseKey: string;
  },
];

type VerseInfoFormat<AsNumbers extends boolean> = [AsNumbers] extends [true] ? number : string;

export const parseVerseRange = <AsNumbers extends boolean>(
  verseRange: string,
  parseAsNumbers?: AsNumbers,
): VerseRangeInfo<VerseInfoFormat<AsNumbers>> => {
  const result = verseRange.match(/(\d+):(\d+)-(\d+):(\d+)/);

  if (!result) {
    return null;
  }

  const [, startChapter, startVerse, endChapter, endVerse] = result;

  if (!startChapter || !startVerse || !endChapter || !endVerse) {
    return null;
  }

  const parse = (value: string) =>
    (parseAsNumbers ? Number(value) : value) as VerseInfoFormat<AsNumbers>;

  return [
    {
      chapter: parse(startChapter),
      verse: parse(startVerse),
      verseKey: `${startChapter}:${startVerse}`,
    },
    {
      chapter: parse(endChapter),
      verse: parse(endVerse),
      verseKey: `${endChapter}:${endVerse}`,
    },
  ];
};
