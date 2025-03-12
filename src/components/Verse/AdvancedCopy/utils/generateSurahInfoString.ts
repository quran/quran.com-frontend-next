import Language from '@/types/Language';
import { toLocalizedNumber, toLocalizedVerseKey } from '@/utils/locale';
import { getVerseNumberFromKey } from '@/utils/verse';

/**
 * Helper function that generates the surah information string
 *
 * @param {string} fromVerse - The starting verse key
 * @param {boolean} showRangeOfVerses - Whether to show a range of verses
 * @param {string} rangeStartVerse - The starting verse in the range
 * @param {string} rangeEndVerse - The ending verse in the range
 * @param {string} lang - The language code
 * @param {object} chaptersData - The chapters data object
 * @returns {string} The formatted surah information string
 */
const generateSurahInfoString = (
  fromVerse,
  showRangeOfVerses,
  rangeStartVerse,
  rangeEndVerse,
  lang,
  chaptersData,
) => {
  const surahNumber = Number(fromVerse.split(':')[0]);
  let surahInfoString = '';

  if (chaptersData && chaptersData[surahNumber]) {
    const surahName =
      lang === Language.AR
        ? chaptersData[surahNumber].transliteratedName
        : chaptersData[surahNumber].translatedName;

    // Create localized verse reference string
    let verseRangeStr;
    if (showRangeOfVerses) {
      const startVerseNum = getVerseNumberFromKey(rangeStartVerse);
      const endVerseNum = getVerseNumberFromKey(rangeEndVerse);
      const localizedRange = `${toLocalizedNumber(startVerseNum, lang)}-${toLocalizedNumber(
        endVerseNum,
        lang,
      )}`;
      const localizedSurahNumber = toLocalizedNumber(surahNumber, lang);
      verseRangeStr = `${localizedSurahNumber}:${localizedRange}`;
    } else {
      verseRangeStr = toLocalizedVerseKey(fromVerse, lang);
    }

    surahInfoString =
      lang === Language.AR ? `(${verseRangeStr}) ${surahName}` : `${surahName} (${verseRangeStr}) `;
  }

  return surahInfoString;
};

export default generateSurahInfoString;
