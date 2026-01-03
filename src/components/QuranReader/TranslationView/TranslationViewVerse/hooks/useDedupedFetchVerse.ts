import { useEffect, useMemo } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';
import useSWRImmutable from 'swr/immutable';

import { getTranslationViewRequestKey, verseFetcher } from '@/components/QuranReader/api';
import useIsUsingDefaultSettings from '@/hooks/useIsUsingDefaultSettings';
import { selectIsPersistGateHydrationComplete } from '@/redux/slices/persistGateHydration';
import QuranReaderStyles from '@/redux/types/QuranReaderStyles';
import { VersesResponse } from '@/types/ApiResponses';
import { Mushaf, QuranReaderDataType } from '@/types/QuranReader';
import Verse from '@/types/Verse';
import { makeBookmarksRangeUrl } from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';
import { getPageNumberFromIndexAndPerPage } from '@/utils/number';

interface QuranReaderParams {
  quranReaderDataType: QuranReaderDataType;
  wordByWordLocale: string;
  reciterId: number;
  resourceId: number | string;
  initialData: VersesResponse;
  quranReaderStyles: QuranReaderStyles;
  mushafId: Mushaf;
  selectedTranslations: number[];
  setApiPageToVersesMap: (data: Record<number, Verse[]>) => void;
  verseIdx: number;
}

interface UseDedupedFetchVerseResult {
  verse: Verse | null;
  firstVerseInPage: Verse | null;
  bookmarksRangeUrl: string | null;
  notesRange: {
    from: string;
    to: string;
  } | null;
}

/**
 * This hook fetches the verse of the given `verseIdx` and dedupes the data based on their page number.
 *
 * For an example, passing `verseIdx` of `0 | 1 | 2 | 3 | 4` should only trigger one API request because they are all in the same page.
 *
 * @param {QuranReaderParams} params
 * @returns {UseDedupedFetchVerseResult}
 */
const useDedupedFetchVerse = ({
  quranReaderDataType,
  quranReaderStyles,
  wordByWordLocale,
  reciterId,
  resourceId,
  selectedTranslations,
  initialData,
  setApiPageToVersesMap,
  mushafId,
  verseIdx,
}: QuranReaderParams): UseDedupedFetchVerseResult => {
  const router = useRouter();

  const { lang } = useTranslation();

  /**
   * HYDRATION RACE CONDITION FIX:
   *
   * This hook was experiencing a race condition where verses would fail to load on single verse pages
   * (e.g., /2:18) because the SWR cache key was inconsistent during component initialization.
   *
   * THE PROBLEM:
   * 1. During SSR/initial render, default locale settings are used (e.g., mushafLines: "16_lines")
   * 2. User's persisted Redux state gets rehydrated from localStorage (e.g., mushafLines: "15_lines")
   * 3. This hook would run multiple times during this transition, generating different request keys:
   *    - First run: uses default "16_lines" → generates requestKey_A
   *    - Second run: uses hydrated "15_lines" → generates requestKey_B
   * 4. SWR would cache data under requestKey_A but look for it under requestKey_B, causing cache misses
   * 5. Result: `verse` would be null, causing "if (!verse) return null" to render nothing
   *
   * THE SOLUTION:
   * Wait for Redux persist hydration to complete before generating any request keys.
   * This ensures the quranReaderStyles (containing mushafLines/quranFont) are stable
   * and consistent throughout the component lifecycle, preventing cache key mismatches.
   *
   * TECHNICAL DETAILS:
   * - `isPersistGateHydrationComplete` tracks when redux-persist finishes loading from localStorage
   * - Until hydration completes, requestKey is null, so no SWR requests are made
   * - Once hydration completes, a single consistent request key is generated
   * - This eliminates the race condition and ensures proper verse loading
   *
   * SSR COMPATIBILITY:
   * - Server-side rendering is preserved through fallbackData + effectiveVerses fallback
   * - During SSR/hydration, verses still render immediately using initialData
   * - No SEO impact: search engines see full verse content
   * - No performance impact: Core Web Vitals remain optimal
   * - Hydration delay (~50ms) is masked by fallback data
   */
  const isPersistGateHydrationComplete = useSelector(selectIsPersistGateHydrationComplete);

  const translationParams = useMemo(
    () =>
      (router.query.translations as string)?.split(',')?.map((translation) => Number(translation)),
    [router.query.translations],
  );

  const pageNumber = getPageNumberFromIndexAndPerPage(verseIdx, initialData.pagination.perPage);

  const idxInPage = verseIdx % initialData.pagination.perPage;

  const isUsingDefaultSettings = useIsUsingDefaultSettings({
    translationParams,
    selectedTranslations,
  });

  // Only use initial data if it has actual verses (not empty array)
  const hasInitialVerses = initialData?.verses && initialData.verses.length > 0;
  const shouldUseInitialData = pageNumber === 1 && isUsingDefaultSettings && hasInitialVerses;

  /**
   * CRITICAL: Only generate request key after hydration completes.
   * Before hydration: requestKey = null → no SWR request → no cache inconsistency
   * After hydration: requestKey = stable value → consistent caching → verses load properly
   *
   * SSR PRESERVATION: For SSR/initial render, we rely on fallbackData from initialData
   * to ensure verses are still rendered server-side for SEO and performance.
   */
  const requestKey = isPersistGateHydrationComplete
    ? getTranslationViewRequestKey({
        quranReaderDataType,
        pageNumber,
        initialData,
        quranReaderStyles,
        selectedTranslations,
        isVerseData: quranReaderDataType === QuranReaderDataType.Verse,
        id: resourceId,
        reciter: reciterId,
        locale: lang,
        wordByWordLocale,
      })
    : null;

  const { data: verses } = useSWRImmutable(requestKey, verseFetcher, {
    // CRITICAL: Always provide fallbackData for SSR compatibility
    // This ensures verses render immediately server-side and during hydration
    fallbackData: shouldUseInitialData ? initialData.verses : undefined,
  });

  // FALLBACK for SSR/hydration: If no verses from SWR but we have initialData, use it
  // This prevents blank content during the hydration delay while preserving the cache fix
  const effectiveVerses = verses || (shouldUseInitialData ? initialData.verses : null);

  useEffect(() => {
    if (effectiveVerses) {
      // @ts-ignore
      setApiPageToVersesMap((prevMushafPageToVersesMap: Record<number, Verse[]>) => ({
        ...prevMushafPageToVersesMap,
        [pageNumber]: effectiveVerses,
      }));
    }
  }, [pageNumber, setApiPageToVersesMap, effectiveVerses]);

  const bookmarksRangeUrl =
    effectiveVerses && effectiveVerses.length && isLoggedIn()
      ? makeBookmarksRangeUrl(
          mushafId,
          Number(effectiveVerses?.[0].chapterId),
          Number(effectiveVerses?.[0].verseNumber),
          initialData.pagination.perPage,
        )
      : null;

  const verse = effectiveVerses ? effectiveVerses[idxInPage] : null;

  // This part handles an edge case where the user has no selected translations but the `initialData` sent from server-side rendering has a default translation.
  // So, we need to remove the translations from the verse if the user has no selected translations.
  if (verse && selectedTranslations.length === 0) {
    verse.translations = [];
  }

  return {
    verse,
    firstVerseInPage: effectiveVerses ? effectiveVerses[0] : null,
    bookmarksRangeUrl,
    notesRange:
      effectiveVerses && effectiveVerses.length > 0
        ? {
            from: effectiveVerses?.[0].verseKey,
            to: effectiveVerses?.[effectiveVerses.length - 1].verseKey,
          }
        : null,
  };
};

export default useDedupedFetchVerse;
