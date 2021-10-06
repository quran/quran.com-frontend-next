import { getAdvancedCopyRawResult } from 'src/api';
import { getMushafId } from 'src/utils/api';

/**
 * Given these parameters, get the `text to be copied` from API
 *
 * @returns {string} textToCopy
 */
const getTextToCopy = ({
  verseKey,
  showRangeOfVerses,
  rangeStartVerse,
  rangeEndVerse,
  translations,
  shouldCopyFootnotes,
  shouldCopyText,
}) => {
  // by default the from and to will be the current verse.
  let fromVerse = verseKey;
  let toVerse = verseKey;
  // if range of verse was selected
  if (showRangeOfVerses) {
    fromVerse = rangeStartVerse;
    toVerse = rangeEndVerse;
  }
  // filter the translations
  const toBeCopiedTranslations = Object.keys(translations).filter(
    (translationId) => translations[translationId].shouldBeCopied === true,
  );
  return getAdvancedCopyRawResult({
    raw: true,
    from: fromVerse,
    to: toVerse,
    footnote: shouldCopyFootnotes,
    ...(toBeCopiedTranslations.length > 0 && {
      translations: toBeCopiedTranslations.join(', '),
    }), // only include the translations when at least 1 translation has been selected.
    ...(shouldCopyText && { ...getMushafId() }), // only include the Quranic text if the user chose to.
  }).then((res) => res.result);
};

export default getTextToCopy;
