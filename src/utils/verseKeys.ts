/* eslint-disable max-lines */
import range from 'lodash/range';

import { getChapterData } from './chapter';

import { PagesLookUpResponse, VersesResponse } from '@/types/ApiResponses';
import ChaptersData from '@/types/ChaptersData';
import { MushafLines, QuranFont } from '@/types/QuranReader';
import { getDefaultWordFields, getMushafId } from '@/utils/api';
import { makeByVerseKeyUrl } from '@/utils/apiPaths';
import {
  isRTLLocale,
  toLocalizedNumber,
  toLocalizedVerseKey,
  toLocalizedVerseKeyRTL,
} from '@/utils/locale';

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
 * Sort verse keys by chapter and verse number in ascending order.
 *
 * This function sorts an array of verse keys (e.g., ['1:2', '2:1', '1:1'])
 * first by chapter number, then by verse number within each chapter.
 * Returns a new array without modifying the original.
 *
 * @example
 * sortVerseKeys(['2:1', '1:3', '1:1']) // returns ['1:1', '1:3', '2:1']
 *
 * @param {string[]} verseKeys - Array of verse keys in the format 'chapter:verse'
 * @returns {string[]} A new sorted array
 */
export const sortVerseKeys = (verseKeys: string[]): string[] => {
  return [...verseKeys].sort((a, b) => {
    const [aChapter, aVerse] = a.split(':').map(Number);
    const [bChapter, bVerse] = b.split(':').map(Number);
    if (aChapter !== bChapter) return aChapter - bChapter;
    return aVerse - bVerse;
  });
};

/**
 * Convert an array of individual verse keys to optimized verse ranges.
 *
 * This function groups sequential verse keys into ranges within the same chapter.
 * Ranges never span across chapter boundaries - each range contains verses from only one chapter.
 * A range is considered sequential when verses are in the same chapter and have consecutive verse numbers.
 *
 * The function first sorts the input, then builds ranges by tracking consecutive sequences within each chapter.
 * Non-consecutive verses or verses from different chapters create separate ranges.
 * Single verses become ranges with the same start and end (e.g., '1:1-1:1').
 *
 * @example
 * verseKeysToRanges(['1:1', '1:2', '1:3']) // returns ['1:1-1:3']
 *
 * @example
 * verseKeysToRanges(['1:6', '1:7', '2:1', '2:2']) // returns ['1:6-1:7', '2:1-2:2']
 *
 * @example
 * verseKeysToRanges(['1:1', '1:3', '1:5']) // returns ['1:1-1:1', '1:3-1:3', '1:5-1:5']
 *
 * @param {string[]} verseKeys - Array of verse keys in the format 'chapter:verse' (e.g., ['1:1', '1:2', '2:1'])
 * @returns {string[]} Array of optimized verse ranges in the format 'fromVerseKey-toVerseKey'
 */
export const verseKeysToRanges = (verseKeys: string[]): string[] => {
  if (verseKeys.length === 0) return [];

  const sortedKeys = sortVerseKeys(verseKeys);
  const ranges: string[] = [];

  let rangeStart = sortedKeys[0];
  let rangeEnd = sortedKeys[0];

  for (let i = 1; i < sortedKeys.length; i += 1) {
    const currentKey = sortedKeys[i];
    const [currentChapter, currentVerse] = currentKey.split(':').map(Number);
    const [prevChapter, prevVerse] = rangeEnd.split(':').map(Number);

    const isConsecutive = currentChapter === prevChapter && currentVerse === prevVerse + 1;

    if (isConsecutive) {
      rangeEnd = currentKey;
    } else {
      ranges.push(`${rangeStart}-${rangeEnd}`);
      rangeStart = currentKey;
      rangeEnd = currentKey;
    }
  }

  ranges.push(`${rangeStart}-${rangeEnd}`);

  return ranges;
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

      const chapterData = getChapterData(chaptersData, from.chapter.toString());
      if (!chapterData) return null;

      const localizedVerseKey = (verseKey: string) =>
        isRTLLocale(lang)
          ? toLocalizedVerseKeyRTL(verseKey, lang)
          : toLocalizedVerseKey(verseKey, lang);

      const chapterName = chapterData.transliteratedName;
      const titleForm = `${chapterName} ${localizedVerseKey(from.verseKey)}`;

      if (from.chapter === to.chapter) {
        if (from.verse === to.verse) return titleForm;
        return `${titleForm}-${toLocalizedNumber(to.verse, lang)}`;
      }

      return `${titleForm}-${localizedVerseKey(to.verseKey)}`;
    })
    .filter((title): title is string => title !== null);
};

/**
 * Build a minimal VersesResponse for QuranReader background rendering.
 *
 * @param {ChaptersData} chaptersData
 * @param {PagesLookUpResponse} pagesLookupResponse
 * @returns {VersesResponse}
 */
export const buildVersesResponse = (
  chaptersData: ChaptersData,
  pagesLookupResponse: PagesLookUpResponse,
): VersesResponse => {
  const numberOfVerses = generateVerseKeysBetweenTwoVerseKeys(
    chaptersData,
    pagesLookupResponse.lookupRange.from,
    pagesLookupResponse.lookupRange.to,
  ).length;

  return {
    metaData: { numberOfVerses },
    pagesLookup: pagesLookupResponse,
    verses: [],
    pagination: {
      perPage: 10,
      currentPage: 1,
      nextPage: null,
      totalRecords: numberOfVerses,
      totalPages: Math.ceil(numberOfVerses / 10),
    },
  };
};

/**
 * Build a verse URL for study mode SSR pages with standard parameters.
 *
 * @param {string} verseKey - The verse key (e.g., "1:1")
 * @param {QuranFont} quranFont - The Quran font style
 * @param {MushafLines} mushafLines - Mushaf lines configuration
 * @param {number[]} translations - Array of translation IDs
 * @returns {string} The formatted API URL
 */
export const buildStudyModeVerseUrl = (
  verseKey: string,
  quranFont: QuranFont,
  mushafLines: MushafLines,
  translations: number[],
): string => {
  const { mushaf: mushafId } = getMushafId(quranFont, mushafLines);

  return makeByVerseKeyUrl(verseKey, {
    words: true,
    translationFields: 'resource_name,language_id',
    translations: translations.join(','),
    ...getDefaultWordFields(quranFont),
    mushaf: mushafId,
    wordTranslationLanguage: 'en',
    wordTransliteration: 'true',
  });
};
