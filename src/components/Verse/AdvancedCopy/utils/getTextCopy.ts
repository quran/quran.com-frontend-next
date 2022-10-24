import { MushafLines } from '@/types/QuranReader';
import { getMushafId } from '@/utils/api';
import { getAdvancedCopyRawResult } from 'src/api';

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
  shouldIncludeTranslatorName,
  shouldCopyFont,
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
    translatorName: shouldIncludeTranslatorName,
    ...(toBeCopiedTranslations.length > 0 && {
      translations: toBeCopiedTranslations.join(', '),
    }), // only include the translations when at least 1 translation has been selected.
    ...(shouldCopyFont && {
      ...getMushafId(shouldCopyFont, MushafLines.SixteenLines),
    }), // only include the fonts when at least 1 font has been selected.
  }).then((res) => res.result);
};

export default getTextToCopy;
