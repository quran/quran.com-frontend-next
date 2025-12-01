import React, { useEffect, useMemo } from 'react';

import { useSelector } from 'react-redux';
import useSWRImmutable from 'swr/immutable';

import { getPageNumberByPageIndex } from '../utils/page';

import Page from './Page';
import ReadingViewSkeleton from './ReadingViewSkeleton';

import { getReaderViewRequestKey, verseFetcher } from '@/components/QuranReader/api';
import useIsLoggedIn from '@/hooks/auth/useIsLoggedIn';
import useIsUsingDefaultSettings from '@/hooks/useIsUsingDefaultSettings';
import { selectIsPersistGateHydrationComplete } from '@/redux/slices/persistGateHydration';
import { selectSelectedTranslations } from '@/redux/slices/QuranReader/translations';
import QuranReaderStyles from '@/redux/types/QuranReaderStyles';
import { getMushafId } from '@/utils/api';
import { areArraysEqual } from '@/utils/array';
import { makeBookmarksRangeUrl } from '@/utils/auth/apiPaths';
import { VersesResponse } from 'types/ApiResponses';
import LookupRecord from 'types/LookupRecord';
import Verse from 'types/Verse';

type Props = {
  pagesVersesRange: Record<number, LookupRecord>;
  quranReaderStyles: QuranReaderStyles;
  reciterId: number;
  lang: string;
  wordByWordLocale: string;
  pageIndex: number;
  setMushafPageToVersesMap: (data: Record<number, Verse[]>) => void;
  initialData: VersesResponse;
};

const getPageVersesRange = (
  currentMushafPage: number,
  apiPagesVersesRange: Record<number, LookupRecord>,
): LookupRecord => {
  const lookupRecord = { ...apiPagesVersesRange[currentMushafPage] };
  // TODO: remove this from BE
  // we remove firstVerseKey and lastVerseKey before we send the params to BE as BE doesn't need them
  delete lookupRecord.firstVerseKey;
  delete lookupRecord.lastVerseKey;
  return lookupRecord;
};

/**
 * Get the verses returned from the initialData of the first page.
 * This function will filter out all the words that don't
 * belong to the first page in-case we have some verses
 * that contain words that don't belong to the first page
 * (applies to 16-line Indopak Mushaf e.g. /ur/haji/25 or /ur/2/211-216)
 *
 * @param {number} pageNumber
 * @param {Verse[]} initialVerses
 * @returns {Verse[]}
 */
const getInitialVerses = (pageNumber: number, initialVerses: Verse[]): Verse[] =>
  initialVerses.map((verse) => ({
    ...verse,
    words: verse.words.filter((word) => word.pageNumber === pageNumber),
  }));

/**
 * A component that will fetch the verses of the current mushaf page
 * and will render a skeleton while it's loading.
 *
 * @param {Props} param0
 * @returns {JSX.Element}
 */
const PageContainer: React.FC<Props> = ({
  pagesVersesRange,
  quranReaderStyles,
  reciterId,
  lang,
  wordByWordLocale,
  pageIndex,
  setMushafPageToVersesMap,
  initialData,
}: Props): JSX.Element => {
  /**
   * HYDRATION RACE CONDITION FIX:
   *
   * This component was experiencing the same race condition as the translation view where verses
   * would fail to load because the SWR cache key was inconsistent during component initialization.
   *
   * THE PROBLEM:
   * 1. During SSR/initial render, default locale settings are used (e.g., mushafLines: "16_lines")
   * 2. User's persisted Redux state gets rehydrated from localStorage (e.g., mushafLines: "15_lines")
   * 3. This component would run multiple times during this transition, generating different request keys:
   *    - First run: uses default "16_lines" → generates requestKey_A
   *    - Second run: uses hydrated "15_lines" → generates requestKey_B
   * 4. SWR would cache data under requestKey_A but look for it under requestKey_B, causing cache misses
   * 5. Result: verses would be null, causing blank content or infinite loading skeletons
   *
   * THE SOLUTION:
   * Wait for Redux persist hydration to complete before generating any request keys.
   * This ensures the quranReaderStyles (containing mushafLines/quranFont) are stable
   * and consistent throughout the component lifecycle, preventing cache key mismatches.
   */
  const isPersistGateHydrationComplete = useSelector(selectIsPersistGateHydrationComplete);
  const { isLoggedIn } = useIsLoggedIn();

  const pageNumber = useMemo(
    () => getPageNumberByPageIndex(pageIndex, pagesVersesRange),
    [pageIndex, pagesVersesRange],
  );
  const initialVerses = useMemo(
    () => (pageIndex === 0 ? getInitialVerses(pageNumber, initialData.verses) : initialData.verses),
    [initialData.verses, pageIndex, pageNumber],
  );

  const selectedTranslations = useSelector(selectSelectedTranslations, areArraysEqual) as number[];

  const isUsingDefaultSettings = useIsUsingDefaultSettings();
  const shouldUseInitialData = pageIndex === 0 && isUsingDefaultSettings;

  /**
   * CRITICAL: Only generate request key after hydration completes.
   * Before hydration: requestKey = null → no SWR request → no cache inconsistency
   * After hydration: requestKey = stable value → consistent caching → verses load properly
   *
   * SSR PRESERVATION: For SSR/initial render, we rely on fallbackData from initialData
   * to ensure verses are still rendered server-side for SEO and performance.
   */
  const requestKey = isPersistGateHydrationComplete
    ? getReaderViewRequestKey({
        pageNumber,
        pageVersesRange: getPageVersesRange(pageNumber, pagesVersesRange),
        quranReaderStyles,
        reciter: reciterId,
        locale: lang,
        wordByWordLocale,
        selectedTranslations,
      })
    : null;

  const { data: verses, isValidating } = useSWRImmutable(requestKey, verseFetcher, {
    // CRITICAL: Always provide fallbackData for SSR compatibility
    // This ensures verses render immediately server-side and during hydration
    fallbackData: shouldUseInitialData ? initialVerses : null,
    revalidateOnMount: !shouldUseInitialData,
  });

  // FALLBACK for SSR/hydration: If no verses from SWR but we have initialData, use it
  // This prevents blank content during the hydration delay while preserving the cache fix
  const effectiveVerses = verses || (shouldUseInitialData ? initialVerses : null);

  useEffect(() => {
    if (effectiveVerses) {
      // @ts-ignore
      setMushafPageToVersesMap((prevMushafPageToVersesMap: Record<number, Verse[]>) => ({
        ...prevMushafPageToVersesMap,
        [pageNumber]: effectiveVerses,
      }));
    }
  }, [pageNumber, setMushafPageToVersesMap, effectiveVerses]);

  // Calculate bookmarks range URL for bulk fetching (memoized to prevent unnecessary recalculations)
  const bookmarksRangeUrl = useMemo(() => {
    if (!effectiveVerses?.length || !isLoggedIn) return null;
    const mushafId = getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines).mushaf;
    return makeBookmarksRangeUrl(
      mushafId,
      Number(effectiveVerses[0].chapterId),
      Number(effectiveVerses[0].verseNumber),
      effectiveVerses.length,
    );
  }, [effectiveVerses, isLoggedIn, quranReaderStyles.quranFont, quranReaderStyles.mushafLines]);

  if (!effectiveVerses || isValidating) {
    return <ReadingViewSkeleton />;
  }

  return (
    <Page
      verses={effectiveVerses}
      key={`page-${pageNumber}`}
      pageNumber={Number(pageNumber)}
      quranReaderStyles={quranReaderStyles}
      pageIndex={pageIndex}
      bookmarksRangeUrl={bookmarksRangeUrl}
    />
  );
};

export default PageContainer;
