import { useMemo } from 'react';

import { isValidVerseId, isValidVerseKey } from '@/utils/validator';
import { getVerseAndChapterNumbersFromKey, makeVerseKey } from '@/utils/verse';
import { generateVerseKeysBetweenTwoVerseKeys } from '@/utils/verseKeys';
import ChaptersData from 'types/ChaptersData';
import LookupRange from 'types/LookupRange';

type QueryParamValue = string | string[] | undefined;

type UseStartingVerseScrollTargetParams = {
  startingVerseQueryParam: QueryParamValue;
  chapterIdQueryParam: QueryParamValue;
  chapterId: string;
  chaptersData: ChaptersData;
  lookupRange?: LookupRange;
};

type StartingVerseScrollTarget = {
  startingVerse?: string;
  targetVerseIndex: number;
  targetVerseKey?: string;
  shouldSkipInitialScroll: boolean;
};

/**
 * Normalize a query parameter to a single value.
 * @returns {string | undefined}
 */
const normalizeQueryParam = (param: QueryParamValue): string | undefined =>
  Array.isArray(param) ? param[0] : param;

/**
 * Build a verseKey used by observer queues for valid targets only.
 * @returns {string | undefined}
 */
const getTargetVerseKey = (
  isValidLookupStartingVerseKey: boolean,
  isValidChapterStartingVerse: boolean,
  startingVerseValue: string,
  chapterId: string,
  startingVerseNumber: number,
): string | undefined => {
  if (isValidLookupStartingVerseKey) {
    const [targetChapterId, targetVerseNumber] =
      getVerseAndChapterNumbersFromKey(startingVerseValue);
    return makeVerseKey(Number(targetChapterId), Number(targetVerseNumber));
  }
  if (isValidChapterStartingVerse) return makeVerseKey(chapterId, startingVerseNumber); // Build verse key for numeric chapter format.
  return undefined; // Keep undefined when there is no valid target.
};

/**
 * Resolve a validated starting-verse target for translation virtualization.
 * @returns {StartingVerseScrollTarget}
 */
const useStartingVerseScrollTarget = ({
  startingVerseQueryParam,
  chapterIdQueryParam,
  chapterId,
  chaptersData,
  lookupRange,
}: UseStartingVerseScrollTargetParams): StartingVerseScrollTarget => {
  const startingVerse = normalizeQueryParam(startingVerseQueryParam);
  const chapterIdFromRoute = normalizeQueryParam(chapterIdQueryParam); // The chapterId route param or undefined on /juz, /page, etc.
  const isChapterScopedRoute = !!chapterIdFromRoute && !String(chapterIdFromRoute).includes(':'); // Chapter ids/slugs do not include ":".
  const startingVerseValue = String(startingVerse || '');
  const isStartingVerseKeyFormat = startingVerseValue.includes(':'); // Detect multi-surah format "SS:VV".
  const startingVerseNumber = Number(startingVerseValue);

  const verseKeysInLookupRange = useMemo(() => {
    // Precompute ordered verse keys for the current reader range.
    if (!lookupRange?.from || !lookupRange?.to) return [];
    return generateVerseKeysBetweenTwoVerseKeys(chaptersData, lookupRange.from, lookupRange.to);
  }, [chaptersData, lookupRange?.from, lookupRange?.to]);

  const isValidChapterStartingVerse =
    isChapterScopedRoute &&
    !!startingVerse &&
    !isStartingVerseKeyFormat &&
    isValidVerseId(chaptersData, chapterId, startingVerseValue);

  const isValidLookupStartingVerseKey =
    !!startingVerse &&
    isStartingVerseKeyFormat &&
    isValidVerseKey(chaptersData, startingVerseValue) &&
    verseKeysInLookupRange.includes(startingVerseValue);

  const targetVerseIndex = useMemo(() => {
    // Resolve absolute virtualized index for both supported formats.
    if (isValidChapterStartingVerse) return startingVerseNumber - 1; // Chapter format maps directly to zero-based index.
    if (isValidLookupStartingVerseKey) return verseKeysInLookupRange.indexOf(startingVerseValue); // Multi-surah format uses lookup key ordering.
    return -1;
  }, [
    isValidChapterStartingVerse,
    startingVerseNumber,
    isValidLookupStartingVerseKey,
    verseKeysInLookupRange,
    startingVerseValue,
  ]);

  const targetVerseKey = useMemo(
    () =>
      getTargetVerseKey(
        isValidLookupStartingVerseKey,
        isValidChapterStartingVerse,
        startingVerseValue,
        chapterId,
        startingVerseNumber,
      ),
    [
      isValidLookupStartingVerseKey,
      isValidChapterStartingVerse,
      startingVerseValue,
      chapterId,
      startingVerseNumber,
    ],
  );

  return {
    startingVerse,
    targetVerseIndex,
    targetVerseKey,
    shouldSkipInitialScroll: isValidChapterStartingVerse && startingVerseNumber <= 1, // Skip verse 1 in chapter mode because it is already at top.
  };
};

export default useStartingVerseScrollTarget;
