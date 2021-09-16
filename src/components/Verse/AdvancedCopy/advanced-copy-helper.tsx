import React from 'react';
import { getAdvancedCopyRawResult } from 'src/api';
import { DEFAULT_MUSHAF } from 'src/utils/api';
import { getVerseNumberFromKey } from 'src/utils/verse';
import useSWRImmutable from 'swr/immutable';
import clipboardCopy from 'clipboard-copy';
import Link, { LinkVariant } from 'src/components/dls/Link/Link';
import { makeAdvancedCopyUrl } from 'src/utils/apiPaths';

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
 * Given these parameters, get the `text to be copied` from API
 */
export const useTextToCopy = ({
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
  const { data } = useSWRImmutable(
    makeAdvancedCopyUrl({
      raw: true,
      from: fromVerse,
      to: toVerse,
      footnote: shouldCopyFootnotes,
      ...(toBeCopiedTranslations.length > 0 && { translations: toBeCopiedTranslations.join(', ') }), // only include the translations when at least 1 translation has been selected.
      ...(shouldCopyText && { mushaf: DEFAULT_MUSHAF }), // only include the Quranic text if the user chose to.
    }),
    () =>
      getAdvancedCopyRawResult({
        raw: true,
        from: fromVerse,
        to: toVerse,
        footnote: shouldCopyFootnotes,
        ...(toBeCopiedTranslations.length > 0 && {
          translations: toBeCopiedTranslations.join(', '),
        }), // only include the translations when at least 1 translation has been selected.
        ...(shouldCopyText && { mushaf: DEFAULT_MUSHAF }), // only include the Quranic text if the user chose to.
      }),
  );

  const result = data?.result;
  return result || ''; // return empty text if the result is null.
};

/**
 * - Validate the range selection
 * - Copy the text to clipboard
 * - update the state if succeed or error
 * - set the error message if there's an error
 */
export const copyText = ({
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
    const objectUrl = window.URL.createObjectURL(new Blob([textToCopy], { type: 'text/plain' }));
    setIsCopied(true);
    setCustomMessage(
      <p>
        Text is copied successfully in your clipboard.{' '}
        <Link href={objectUrl} download="quran.copy.txt" variant={LinkVariant.Highlight}>
          Click here
        </Link>{' '}
        if you want to download text file.
      </p>,
    );
  });
};
