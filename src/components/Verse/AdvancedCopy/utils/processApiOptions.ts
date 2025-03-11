import { MushafLines } from '@/types/QuranReader';
import { getMushafId } from '@/utils/api';

/**
 * Processes API options for the advanced copy feature
 *
 * @param {string} fromVerse - The starting verse key
 * @param {string} toVerse - The ending verse key
 * @param {boolean} shouldCopyFootnotes - Whether to copy footnotes
 * @param {boolean} shouldIncludeTranslatorName - Whether to include translator name
 * @param {string[]} toBeCopiedTranslations - List of translation IDs to copy
 * @param {any} shouldCopyFont - Font option for copying
 * @returns {object} Processed API options
 */
const processApiOptions = (
  fromVerse,
  toVerse,
  shouldCopyFootnotes,
  shouldIncludeTranslatorName,
  toBeCopiedTranslations,
  shouldCopyFont,
) => ({
  raw: true,
  from: fromVerse,
  to: toVerse,
  footnote: shouldCopyFootnotes,
  translatorName: shouldIncludeTranslatorName,
  ...(toBeCopiedTranslations.length > 0 && {
    translations: toBeCopiedTranslations.join(', '),
  }),
  ...(shouldCopyFont && {
    ...getMushafId(shouldCopyFont, MushafLines.SixteenLines),
  }),
});

export default processApiOptions;
