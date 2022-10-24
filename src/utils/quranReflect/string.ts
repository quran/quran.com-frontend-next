import ReflectionFilter from 'types/QuranReflect/ReflectionFilter';
import { ReflectionVerseReference } from 'types/QuranReflect/ReflectionVerseReference';
import TrimmedCitationTexts from 'types/QuranReflect/TrimmedCitationTexts';

/**
 * Extract the verse references from reflection data
 *
 * @param {any} filters
 * @returns {ReflectionVerseReference[]} verseReferences
 */
export const getVerseReferencesFromReflectionFilters = (
  filters: ReflectionFilter[],
): ReflectionVerseReference[] => {
  return filters.map((filter) => {
    const { surahNumber, from, to } = filter;

    return {
      chapter: Number(surahNumber),
      from: Number(from),
      to: Number(to),
    };
  });
};

const getSurahNameByGroupTranslationId = (
  filters: ReflectionFilter[],
  groupSurahNumber: number,
  groupTranslationId: number,
) => {
  const matchedSurahFilters = filters.find((filter) => {
    const { surahNumber } = filter;
    return surahNumber === groupSurahNumber;
  });
  const {
    chapter: { citationNames },
  } = matchedSurahFilters;
  const defaultCitationName = citationNames.find((citationName) => {
    const { translationId } = citationName;
    return groupTranslationId === translationId;
  });
  return defaultCitationName.name;
};

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

export const getCopyReflectionContent = (
  trimmedCitationTexts: TrimmedCitationTexts,
  filters: ReflectionFilter[],
) => {
  let copyReflectionContent = '';
  Object.keys(trimmedCitationTexts).forEach((index) => {
    const citationTextGroup = trimmedCitationTexts[index];
    if (citationTextGroup?.[0]) {
      let citationGroupText = '';
      let groupSurahNumber: number;
      let groupTranslationId: number;
      const groupAyahNumbers = [];
      citationTextGroup?.[0].forEach((citationDetails) => {
        const { citationId, number: ayahNumber, translationId } = citationDetails;
        groupTranslationId = translationId;
        groupSurahNumber = Number(citationId) - 1;
        groupAyahNumbers.push(ayahNumber);
        citationGroupText += `${citationDetails.text} (${citationDetails.number}) `;
      });
      const surahName = getSurahNameByGroupTranslationId(
        filters,
        groupSurahNumber,
        groupTranslationId,
      );
      copyReflectionContent += `${getCitationSummary(
        groupAyahNumbers,
        groupSurahNumber,
        surahName,
      )}\r\n${citationGroupText}\r\n\r\n`;
    }
  });
  return copyReflectionContent;
};
