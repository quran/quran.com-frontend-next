import { getVerseNumberFromKey } from 'src/utils/verse';
import clipboardCopy from 'clipboard-copy';

/**
 * Validate the selected range start and end verse keys. The selection will be invalid in the following cases:
 *
 * 1. One of the two ranges have been cleared and don't have a value.
 * 2. The range start and end verses are the same which is not a valid range. The user should have selected current verse option instead.
 * 3. The range end verse is before the range start verse e.g. from verse 6 -> verse 4.
 *
 * @param {string} selectedRangeStartVerseKey
 * @param {string} selectedRangeEndVerseKey
 * @returns {string|null} if it's null it means the validation passed.
 */
const validateRangeSelection = (
  selectedRangeStartVerseKey: string,
  selectedRangeEndVerseKey: string,
): string | null => {
  // if one of them is empty.
  if (!selectedRangeStartVerseKey || !selectedRangeEndVerseKey) {
    return 'Range start and end must have a value.';
  }
  // if both keys are the same.
  if (selectedRangeStartVerseKey === selectedRangeEndVerseKey) {
    return 'Range start and end should be different.';
  }
  // if the selected from verse number is higher than the selected to verse number.
  if (
    getVerseNumberFromKey(selectedRangeStartVerseKey) >
    getVerseNumberFromKey(selectedRangeEndVerseKey)
  ) {
    return 'The starting verse has to be before the ending verse.';
  }
  return null;
};

/**
 * - Validate the range selection
 * - Copy the text to clipboard
 * - update the state if succeed or error
 * - set the error message if there's an error
 */

const copyText = ({
  textToCopy,
  rangeStartVerse,
  rangeEndVerse,
  showRangeOfVerses,
  setCustomMessage,
  setIsCopied,
}) => {
  // if a range is selected, we need to validate it first
  if (showRangeOfVerses) {
    const validationError = validateRangeSelection(rangeStartVerse, rangeEndVerse);
    // if the validation fails
    if (validationError) {
      setCustomMessage(validationError);
      return;
    }
  }

  clipboardCopy(textToCopy).then(() => {
    setIsCopied(true);
  });
};

export default copyText;
