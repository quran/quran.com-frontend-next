import getTextToCopy from './getTextCopy';

import { textToBlob } from '@/utils/blob';
import copyText from '@/utils/copyText';

/**
 * given these params,
 * get the data from the API
 * and copy the result to clipboard
 *
 * @returns {Promise<Blob>} textBlobPromise
 */
const copyVerse = async ({
  showRangeOfVerses,
  rangeEndVerse,
  rangeStartVerse,
  shouldCopyFootnotes,
  shouldIncludeTranslatorName,
  shouldCopyFont,
  translations,
  verseKey,
}) => {
  const textBlobPromise = getTextToCopy({
    rangeEndVerse,
    rangeStartVerse,
    shouldCopyFootnotes,
    shouldCopyFont,
    shouldIncludeTranslatorName,
    showRangeOfVerses,
    translations,
    verseKey,
  }).then(textToBlob);

  copyText(textBlobPromise);
  return textBlobPromise;
};

export default copyVerse;
