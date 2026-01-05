import { useCallback, useEffect, useRef } from 'react';

import { getVersePageNumber } from '@/api';
import { logErrorToSentry } from '@/lib/sentry';
import { MushafLines, QuranFont } from '@/types/QuranReader';
import { VersesResponse } from 'types/ApiResponses';

/**
 * Custom hook for fetching verse page number with AbortController support.
 *
 * @description
 * This hook does NOT use SWR because the fetch is triggered imperatively from a callback (`scrollToVerse`),
 * not declaratively based on component mount or prop changes. SWR is designed for declarative data fetching
 * where the key determines when to fetch. We also need fine-grained AbortController control for race condition
 * handling and request cancellation.
 *
 * @param {QuranFont} quranFont the selected Quran font
 * @param {MushafLines} mushafLines the selected mushaf lines
 * @returns {Function} A function to fetch verse page number
 */
const useFetchVersePageNumber = (quranFont: QuranFont, mushafLines: MushafLines) => {
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup the abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  /**
   * Fetch the page number for a specific verse.
   *
   * @param {string} chapterId the chapter ID
   * @param {number} verseNumber the verse number
   * @returns {Promise<VersesResponse | void>} The verses response containing page number, or void if aborted
   */
  const fetchVersePageNumber = useCallback(
    async (chapterId: string, verseNumber: number): Promise<VersesResponse | void> => {
      // Abort previous request (if any) to prevent race conditions
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        return await getVersePageNumber(
          chapterId,
          verseNumber,
          quranFont,
          mushafLines,
          controller.signal,
        );
      } catch (error: unknown) {
        // Ignore abort errors (they're expected when canceling stale requests)
        if (error instanceof Error && error.name === 'AbortError') {
          return undefined;
        }

        // Log other errors to Sentry
        logErrorToSentry(error, {
          transactionName: 'fetchVersePageNumber',
          metadata: { chapterId, verseNumber },
        });

        return undefined;
      }
    },
    [quranFont, mushafLines],
  );

  return fetchVersePageNumber;
};

export default useFetchVersePageNumber;
