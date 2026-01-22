import buildVerseURL from './buildVerseURL';
import generateSurahInfoString from './generateSurahInfoString';
import processApiOptions from './processApiOptions';

import Language from '@/types/Language';
import { getAdvancedCopyRawResult } from 'src/api';

/**
 * Given these parameters, get the `text to be copied` from API
 *
 * @param {object} options - Options for the copy request
 * @param {string} options.verseKey - The verse key
 * @param {boolean} options.showRangeOfVerses - Whether to show a range of verses
 * @param {string} options.rangeStartVerse - The starting verse in the range
 * @param {string} options.rangeEndVerse - The ending verse in the range
 * @param {object} options.translations - The translations object
 * @param {boolean} options.shouldCopyFootnotes - Whether to copy footnotes
 * @param {boolean} options.shouldIncludeTranslatorName - Whether to include translator name
 * @param {boolean} options.shouldCopyFont - Whether to copy font
 * @param {string} [options.lang='en'] - The language code
 * @param {object} options.chaptersData - The chapters data object
 * @returns {Promise<string>} textToCopy
 */
const getTextToCopy = ({
  verseKey,
  showRangeOfVerses,
  rangeStartVerse,
  rangeEndVerse,
  translations,
  shouldCopyFootnotes,
  shouldIncludeTranslatorName,
  shouldCopyFont,
  lang = Language.EN,
  chaptersData,
}) => {
  // Determine verse range
  let fromVerse = verseKey;
  let toVerse = verseKey;

  if (showRangeOfVerses) {
    fromVerse = rangeStartVerse;
    toVerse = rangeEndVerse;
  }

  // Filter translations to copy
  const toBeCopiedTranslations = Object.keys(translations).filter(
    (translationId) => translations[translationId].shouldBeCopied === true,
  );

  const verseUrl = buildVerseURL(fromVerse, toVerse, lang);

  // Generate surah info string
  const surahInfoString = generateSurahInfoString(
    fromVerse,
    showRangeOfVerses,
    rangeStartVerse,
    rangeEndVerse,
    lang,
    chaptersData,
  );

  // Process API options
  const apiOptions = processApiOptions(
    fromVerse,
    toVerse,
    shouldCopyFootnotes,
    shouldIncludeTranslatorName,
    toBeCopiedTranslations,
    shouldCopyFont,
  );

  // Get the result and format the final text
  return getAdvancedCopyRawResult(apiOptions).then((res) => {
    const text = showRangeOfVerses ? res.result : res.result.split('\n').slice(2).join('\n'); // Remove the first 2 lines which contain the verse key

    return `${surahInfoString}\n\n${text}${verseUrl}`;
  });
};

export default getTextToCopy;
