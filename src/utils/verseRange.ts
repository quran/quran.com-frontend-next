/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable import/prefer-default-export */
// import type ChaptersData from '@/types/ChaptersData';
import { getChapterData } from './chapter';
import { generateVerseKeysBetweenTwoVerseKeys } from './verseKeys';

import ChaptersData from '@/types/ChaptersData';
import { getVerseAndChapterNumbersFromKey } from '@/utils/verse';

// given an array of verse keys, merge back to back verses into a single range like this:
// ['1:1', '1:2', '1:3', '1:7'] will be ['1:1-1:3', '1:7-1:7']
export function mergeVerseKeys(
  verses: Set<string>,
  // chaptersData: ChaptersData
) {
  const combinedVerses = new Set<string>();
  const verseMap: { [key: string]: number[] } = {};

  // Create a map of chapter to verse numbers
  verses.forEach((verseKey) => {
    const [chapter, verseNumber] = getVerseAndChapterNumbersFromKey(verseKey);
    if (!verseMap[chapter]) verseMap[chapter] = [];
    verseMap[chapter].push(Number(verseNumber));
  });

  // Merge the verse numbers for each chapter
  const entries = Object.entries(verseMap);
  for (let i = 0; i < entries.length; i += 1) {
    // eslint-disable-next-line prefer-const
    const [chapter, verseNumbers] = entries[i];
    verseNumbers.sort((a, b) => a - b);

    let start = verseNumbers[0];
    let end = start;

    for (let j = 1; j < verseNumbers.length; j += 1) {
      // merge back to back verses into a single range
      // OR
      // merge verses into a single range if they are not back to back but the distance is 1
      // e.g. 1:1, 1:2, 1:3, 1:5 will be merged into 1:1-1:5
      if (verseNumbers[j] === end + 1 || verseNumbers[j] === end + 2) end = verseNumbers[j];
      else {
        combinedVerses.add(`${chapter}:${start}-${chapter}:${end}`);
        start = verseNumbers[j];
        end = start;
      }
    }
    combinedVerses.add(`${chapter}:${start}-${chapter}:${end}`);
  }

  return combinedVerses;
}

// merge verse ranges like this:
// e.g. [1:1-1:7, 2:1-2:10] will be merged into [1:7-2:10]
// OR
// e.g. [2:4-2:5, 2:6-2:7] will be merged into [2:4-2:7]
// OR
// e.g. [2:4-2:10, 2:5-2:6] will be merged into [2:4-2:10]
// we could use chaptersData to get the number of verses in each chapter
export const mergeVerseRanges = (ranges: string[], chaptersData: ChaptersData) => {
  const verseKeys = new Set<string>();
  const combinedVerses = new Set<string>();

  ranges.forEach((range) => {
    const [from, to] = range.split('-');
    const verseKeysBetween = generateVerseKeysBetweenTwoVerseKeys(chaptersData, from, to);
    verseKeysBetween.forEach((verseKey) => verseKeys.add(verseKey));
  });

  // convert verseKeys to a sorted array
  const verseKeysArray = Array.from(verseKeys).sort((a, b) => {
    const [chapterA, verseA] = getVerseAndChapterNumbersFromKey(a);
    const [chapterB, verseB] = getVerseAndChapterNumbersFromKey(b);

    if (chapterA === chapterB) return Number(verseA) - Number(verseB);
    return Number(chapterA) - Number(chapterB);
  });

  let start = null;
  let end = null;
  verseKeysArray.forEach((verseKey) => {
    if (!start) start = verseKey;
    if (!end) end = verseKey;
    else {
      const [chapter, verse] = getVerseAndChapterNumbersFromKey(verseKey);
      const [endChapter, endVerse] = getVerseAndChapterNumbersFromKey(end);
      if (chapter === endChapter && Number(verse) === Number(endVerse) + 1) end = verseKey;
      else if (incrementVerseKey(end, chaptersData) === verseKey) end = verseKey;
      else {
        combinedVerses.add(`${start}-${end}`);
        start = verseKey;
        end = verseKey;
      }
    }
  });
  combinedVerses.add(`${start}-${end}`);

  return Array.from(combinedVerses);
};

export const incrementVerseKey = (verseKey: string, chaptersData: ChaptersData) => {
  const [chapter, verse] = getVerseAndChapterNumbersFromKey(verseKey);
  const chapterData = getChapterData(chaptersData, chapter);

  const chapterNumber = Number(chapter);
  const verseNumber = Number(verse);

  const { versesCount } = chapterData;

  if (verseNumber < versesCount) return `${chapter}:${verseNumber + 1}`;
  if (chapterNumber < 114) return `${chapterNumber + 1}:1`;

  return verseKey;
};

export const decrementVerseKey = (verseKey: string, chaptersData: ChaptersData) => {
  const [chapter, verse] = getVerseAndChapterNumbersFromKey(verseKey);

  const chapterNumber = Number(chapter);
  const verseNumber = Number(verse);

  if (verseNumber > 1) return `${chapter}:${verseNumber - 1}`;

  if (chapterNumber > 1) {
    const newChapter = chapterNumber - 1;
    const chapterData = getChapterData(chaptersData, String(newChapter));
    const { versesCount } = chapterData;
    return `${newChapter}:${versesCount}`;
  }

  return verseKey;
};
