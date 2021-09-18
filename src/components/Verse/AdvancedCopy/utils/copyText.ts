import clipboardCopy from 'clipboard-copy';

import getTextToCopy from './getTextCopy';
import validateRangeSelection from './validateRangeSelection';

/**
 * - Validate the range selection
 * - Copy the text to clipboard
 * - update the state if succeed or error
 * - set the error message if there's an error
 */

// eslint-disable-next-line react-func/max-lines-per-function
const copyText = async ({
  showRangeOfVerses,
  rangeEndVerse,
  rangeStartVerse,
  shouldCopyFootnotes,
  shouldCopyText,
  translations,
  verseKey,
}) => {
  // if a range is selected, we need to validate it first
  if (showRangeOfVerses) {
    const validationError = validateRangeSelection(rangeStartVerse, rangeEndVerse);
    // if the validation fails
    if (validationError) {
      throw validationError;
    }
  }

  const getTextBlobPromise = () =>
    getTextToCopy({
      rangeEndVerse,
      rangeStartVerse,
      shouldCopyFootnotes,
      shouldCopyText,
      showRangeOfVerses,
      translations,
      verseKey,
    }).then((text) => new Blob([text], { type: 'text/plain' }));

  const textBlobPromise = getTextBlobPromise();

  /**
   * Safari supports `text/plain` : promise
   * Chrome doesn't support it.
   *
   * Safari needs `navigator.clipboard` to be called immediately without waiting
   * Chrome can wait
   *
   * So, for safari we call it navigator.clipboard immediately and give it a promise
   * for chrome we wait for the promise to resolve, the we call navigator.clipboard
   */

  try {
    copyOnSafari(textBlobPromise);
    return textBlobPromise;
  } catch (e) {
    const blob = await textBlobPromise;
    const text = await blob.text();
    // revert to use library for chrome;
    await clipboardCopy(text);
    return textBlobPromise;
  }
};

const copyOnSafari = (blobPromise) => {
  navigator.clipboard.write([new ClipboardItem({ 'text/plain': blobPromise })]);
};

export default copyText;
