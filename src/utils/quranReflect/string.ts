import { getChapterData } from '../chapter';

import ChaptersData from '@/types/ChaptersData';
import Reference from '@/types/QuranReflect/Reference';

/**
 * Get the summary of the citation e.g.
 * "Chapter 1: The Opening, Verses:  1 - 7"
 *
 * @param {number[]} groupAyahNumbers an array of verse numbers of the citation group.
 * @param {number} groupSurahNumber the Surah number of the group.
 * @param {string} surahName the Surah name
 * @returns {string}
 */
export const getCitationSummary = (
  groupAyahNumbers: number[],
  groupSurahNumber: number,
  surahName: string,
): string => {
  const citationNumberOfAyahs = groupAyahNumbers.length;
  return `Chapter ${groupSurahNumber}: ${surahName}, Verse${
    citationNumberOfAyahs > 1
      ? `s:  ${groupAyahNumbers[0]} - ${groupAyahNumbers[citationNumberOfAyahs - 1]}`
      : `:  ${groupAyahNumbers[0]}`
  }`;
};

// A lightweight type to augment Reference with optional chapter citation names
type CitationName = { translationId: number; name: string };
type FilterWithChapter = Reference & { chapter?: { citationNames?: CitationName[] } };

const buildGroupCopyBlock = (
  verses: any[],
  filterAtIndex: FilterWithChapter | undefined,
  allFilters: FilterWithChapter[],
  chaptersData: ChaptersData,
): string => {
  if (!verses || verses.length === 0) return '';

  const firstVerse = verses[0] || {};
  const groupSurahNumber = Number(firstVerse.chapterId ?? filterAtIndex?.chapterId);

  // If filter at the same index isn't available, try to find one matching the chapter
  const filter = filterAtIndex || allFilters.find((f) => Number(f.chapterId) === groupSurahNumber);

  const selectedTranslationId = Number(
    firstVerse?.translations?.[0]?.id ?? filter?.chapter?.citationNames?.[0]?.translationId,
  );

  const chapterData = getChapterData(chaptersData, groupSurahNumber.toString());

  const surahName = chapterData.transliteratedName;

  const groupAyahNumbers: number[] = [];
  let citationGroupText = '';
  verses.forEach((v) => {
    const verseNumber = Number(v.verseNumber);
    groupAyahNumbers.push(verseNumber);
    const translationText =
      v?.translations?.find?.((tr: any) => Number(tr.id) === selectedTranslationId)?.text ||
      v?.translations?.[0]?.text ||
      v?.textUthmani ||
      '';
    citationGroupText += `${translationText} (${verseNumber}) `;
  });

  return `${getCitationSummary(
    groupAyahNumbers,
    groupSurahNumber,
    surahName,
  )}\r\n${citationGroupText}\r\n\r\n`;
};

/**
 * Build the copyable reflection content directly from verses API response.
 * versesByIndex is a map of the filter index -> Verse[] (as returned by getRangeVerses).
 * @returns {string} Concatenated copy content for all groups
 */
export const getCopyReflectionContent = (
  versesByIndex: Record<number | string, any[]>,
  chaptersData: ChaptersData,
  filters: FilterWithChapter[] = [],
): string => {
  let copyReflectionContent = '';

  Object.keys(versesByIndex).forEach((indexKey) => {
    const verses = versesByIndex[indexKey as any];
    const block = buildGroupCopyBlock(verses, filters?.[Number(indexKey)], filters, chaptersData);
    copyReflectionContent += block;
  });

  return copyReflectionContent;
};

/**
 * Determines if a reference ID represents a full Surah (chapter) or specific verses
 *
 * @param {string} id - The reference ID in format: surah-{chapterNumber}-{verseStart}:{verseEnd} or surah-{chapterNumber}
 * @returns {boolean} - True if the reference represents a full Surah, false if it represents specific verses
 *
 * @example
 * isSurahReference('surah-2') // true - full Surah
 * isSurahReference('surah-18-4:5') // false - verse range
 * isSurahReference('surah-8-12:12') // false - single verse
 */
export const isSurahReference = (id: string): boolean => {
  if (!id || typeof id !== 'string') {
    return false;
  }

  // Split by hyphens to get parts
  const parts = id.split('-');

  // Should start with 'surah' and have at least 2 parts (surah-{number})
  if (parts.length < 2 || parts[0] !== 'surah') {
    return false;
  }

  // If there are only 2 parts (surah-{number}), it's a full Surah
  if (parts.length === 2) {
    // Validate that the second part is a number
    return !Number.isNaN(Number(parts[1])) && Number(parts[1]) > 0;
  }

  // If there are 3 or more parts, it contains verse references, so it's not a full Surah
  return false;
};
