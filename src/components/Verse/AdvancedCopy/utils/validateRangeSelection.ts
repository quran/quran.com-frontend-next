import { Translate } from 'next-translate';

import ChaptersData from '@/types/ChaptersData';
import { getVerseNumberFromKey } from '@/utils/verse';
import { generateVerseKeysBetweenTwoVerseKeys } from '@/utils/verseKeys';

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
  t: Translate,
  maxNumberOfVerses?: number,
  chaptersData?: ChaptersData,
): string | null => {
  // if one of them is empty.
  if (!selectedRangeStartVerseKey || !selectedRangeEndVerseKey) {
    return t('common:error.ranges-no-value');
  }
  // if the selected from verse number is higher than the selected to verse number.
  if (
    getVerseNumberFromKey(selectedRangeStartVerseKey) >
    getVerseNumberFromKey(selectedRangeEndVerseKey)
  ) {
    return t('common:error.ranges-wrong-order');
  }

  if (maxNumberOfVerses) {
    const numberOfVerses = generateVerseKeysBetweenTwoVerseKeys(
      chaptersData,
      selectedRangeStartVerseKey,
      selectedRangeEndVerseKey,
    ).length;
    if (numberOfVerses > maxNumberOfVerses) {
      return t('common:error.ranges-too-many-verses', { maxNumberOfVerses });
    }
  }

  return null;
};

export default validateRangeSelection;
