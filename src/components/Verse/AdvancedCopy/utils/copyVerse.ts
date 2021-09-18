import getTextToCopy from './getTextCopy';

import { textToBlob } from 'src/utils/blob';
import copyText from 'src/utils/copyText';

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
  shouldCopyText,
  translations,
  verseKey,
}) => {
  const textBlobPromise = getTextToCopy({
    rangeEndVerse,
    rangeStartVerse,
    shouldCopyFootnotes,
    shouldCopyText,
    showRangeOfVerses,
    translations,
    verseKey,
  }).then(textToBlob);

  copyText(textBlobPromise);
  return textBlobPromise;
};

export default copyVerse;
