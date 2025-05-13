import getTextToCopy from './getTextCopy';

import Language from '@/types/Language';
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
  lang = Language.EN,
  chaptersData,
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
    lang,
    chaptersData,
  }).then(textToBlob);

  copyText(textBlobPromise);
  return textBlobPromise;
};

export default copyVerse;
