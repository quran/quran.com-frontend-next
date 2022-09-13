import { ReflectionVerseReference } from 'types/ReflectionVerseReference';

/**
 * From reflection data, extract the verse references
 * This is is a temporary function, once we migrate to use Quran.com's API we will probably remove this function
 *
 * @param {any} filters
 * @returns {ReflectionVerseReference[]} verseReferences
 */
export const getVerseReferencesFromReflection = (filters: any): ReflectionVerseReference[] => {
  return filters.map((filter) => {
    const { surahNumber, from, to } = filter;

    return {
      chapter: Number(surahNumber),
      from: Number(from),
      to: Number(to),
    };
  });
};

const getSurahNameByGroupTranslationId = (filters: any[], groupSurahNumber, groupTranslationId) => {
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

export const parseTrimmedCitationTexts = (trimmedCitationTexts, filters: any[]) => {
  let parsedString = '';
  Object.keys(trimmedCitationTexts).forEach((index) => {
    const citationTextGroup = trimmedCitationTexts[index];
    if (citationTextGroup?.[0]) {
      let groupText = '';
      let groupSurahNumber;
      let groupTranslationId;
      const groupAyahNumbers = [];
      citationTextGroup?.[0].forEach((citationDetails) => {
        const { citationId, number: ayahNumber, translationId } = citationDetails;
        groupTranslationId = translationId;
        groupSurahNumber = Number(citationId) - 1;
        groupAyahNumbers.push(ayahNumber);
        groupText += `${citationDetails.text} (${citationDetails.number}) `;
      });
      const chapterName = getSurahNameByGroupTranslationId(
        filters,
        groupSurahNumber,
        groupTranslationId,
      );
      parsedString += `Chapter ${groupSurahNumber}: ${chapterName}, Verse${
        groupAyahNumbers.length > 1 ? 's' : ''
      }:  ${groupAyahNumbers.join(' - ')}\r\n${groupText}\r\n\r\n`;
    }
  });
  return parsedString;
};
