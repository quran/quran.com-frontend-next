import range from 'lodash/range';

import { getChapterData } from './chapter';

import ChaptersData from '@/types/ChaptersData';
import { shouldUseMinimalLayout, toLocalizedVerseKey } from '@/utils/locale';

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

export type VerseRangeInfo<T> = [
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

/**
 * Convert verse ranges to verse keys.
 *
 * @param {ChaptersData} chaptersData
 * @param {string[]} verseRanges Verse ranges
 * @returns {string[]} Unique verse keys
 */
export const verseRangesToVerseKeys = (
  chaptersData: ChaptersData,
  verseRanges: string[],
): string[] => {
  return Array.from(
    new Set(
      verseRanges
        .map((verseRange) => {
          const parsedRange = parseVerseRange(verseRange, true);
          if (!parsedRange) return [];

          return generateVerseKeysBetweenTwoVerseKeys(
            chaptersData,
            parsedRange[0].verseKey,
            parsedRange[1].verseKey,
          );
        })
        .flat(),
    ),
  );
};

/**
 * Format verse ranges to show surah name and verse range in user's locale
 * @param {string[]} rangeKeys Range keys array
 * @param {ChaptersData} chaptersData Chapters data
 * @param {string} lang Language code
 * @returns {string[]} Readable verse range strings array
 */
export const readableVerseRangeKeys = (
  rangeKeys: string[],
  chaptersData: ChaptersData,
  lang: string,
): string[] => {
  return rangeKeys
    .map((rangeKey) => {
      const parsedRange = parseVerseRange(rangeKey, true);
      if ((parsedRange?.length ?? 0) !== 2) return null;

      const from = parsedRange[0];
      const to = parsedRange[1];

      const showMinimalUi = shouldUseMinimalLayout(lang);

      const chapterData = getChapterData(chaptersData, from.chapter.toString());
      if (!chapterData) return null;

      const chapterName = showMinimalUi
        ? chapterData.translatedName
        : chapterData.transliteratedName;

      const titleForm = `${chapterName} ${toLocalizedVerseKey(from.verseKey, lang)}`;

      if (from.chapter === to.chapter && from.verse === to.verse) {
        return titleForm;
      }

      return `${titleForm}-${toLocalizedVerseKey(to.verseKey, lang)}`;
    })
    .filter((title): title is string => title !== null);
};
