import useSWRImmutable from 'swr/immutable';

import { getAdvancedCopyRawResult } from 'src/api';
import { DEFAULT_MUSHAF } from 'src/utils/api';
import { makeAdvancedCopyUrl } from 'src/utils/apiPaths';

/**
 * Given these parameters, get the `text to be copied` from API
 */
const useTextToCopy = ({
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
  const { data, isValidating } = useSWRImmutable(
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

  const result = data?.result || '';
  return { textToCopy: result, loading: isValidating };
};

export default useTextToCopy;
