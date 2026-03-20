import { useContext, useEffect } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useStore } from 'react-redux';

import DataContext from '@/contexts/DataContext';
import useBrowserLayoutEffect from '@/hooks/useBrowserLayoutEffect';
import useChapterIdsByUrlPath from '@/hooks/useChapterId';
import { RootState } from '@/redux/RootState';
import { setLastReadVerse } from '@/redux/slices/QuranReader/readingTracker';
import { normalizeQueryParam, QueryParamValue } from '@/utils/url';
import { VersesResponse } from 'types/ApiResponses';

const getNormalizedStartingVerse = (startingVerse: QueryParamValue): number => {
  const normalizedStartingVerse = normalizeQueryParam(startingVerse);
  if (!normalizedStartingVerse) return 1;

  const parsedStartingVerse = Number(normalizedStartingVerse);
  return Number.isNaN(parsedStartingVerse) || parsedStartingVerse < 1 ? 1 : parsedStartingVerse;
};

/**
 * Check if we should sync the chapter from the URL for this page.
 *
 * We only allow this on plain chapter reader routes (`/[chapterId]`) and when
 * the payload looks like a chapter page (first verse is verse 1).
 * We skip verse-like params such as `20:49`.
 *
 * @param {object} params - Values used by the check.
 * @param {string} params.pathname - Current Next.js pathname (for example '/[chapterId]').
 * @param {string | undefined} params.routeChapterId - Normalized chapterId from query.
 * @param {number | undefined} params.firstVerseNumber - Verse number of `initialData.verses[0]`.
 * @returns {boolean} True if URL chapter sync should run.
 */
const shouldSyncChapterFromRoute = ({
  pathname,
  routeChapterId,
  firstVerseNumber,
}: {
  pathname: string;
  routeChapterId?: string;
  firstVerseNumber?: number;
}): boolean => {
  const isPlainChapterReaderPath = pathname === '/[chapterId]';
  const isVerseLikeChapterParam = routeChapterId?.includes(':');
  const isChapterLikePayload = firstVerseNumber === 1;

  return (
    isPlainChapterReaderPath &&
    Boolean(routeChapterId) &&
    !isVerseLikeChapterParam &&
    isChapterLikePayload
  );
};

/**
 * A hook that sets the initial page state when navigating to any content type
 * (Surah, Verse, Juz, Page, Hizb, Rub, Range).
 *
 * Uses initialData.verses[0] directly which contains all needed data:
 * - verseKey, chapterId, pageNumber, hizbNumber
 *
 * This works for ALL navigation scenarios (49 combinations × 2 modes = 98 total)
 * and updates IMMEDIATELY on navigation (no scrolling required).
 *
 * Uses useBrowserLayoutEffect to ensure state is set synchronously before paint,
 * so the correct page number is displayed immediately.
 *
 * Additional route sync:
 * - On plain chapter routes (`/[chapterId]`) only, we also align chapter context with the URL
 *   (and `startingVerse` when needed) without clobbering in-chapter scroll progress.
 *
 * @param {VersesResponse} initialData - The initial verses data from the page
 */
const useSyncChapterPage = (initialData: VersesResponse): void => {
  const dispatch = useDispatch();
  const store = useStore<RootState>();
  const router = useRouter();
  const { lang } = useTranslation('common');
  const chaptersData = useContext(DataContext);
  const firstVerse = initialData?.verses?.[0];
  const routeChapterId = normalizeQueryParam(router.query.chapterId);
  const hasChapterIdInRoute = shouldSyncChapterFromRoute({
    pathname: router.pathname,
    routeChapterId,
    firstVerseNumber: firstVerse?.verseNumber,
  });
  const chapterIdsByUrlPath = useChapterIdsByUrlPath(lang);
  const urlChapterId = hasChapterIdInRoute ? chapterIdsByUrlPath?.[0] : undefined;

  // Use verseKey as the dependency to detect navigation changes
  const firstVerseKey = firstVerse?.verseKey;
  const normalizedStartingVerse = getNormalizedStartingVerse(router.query.startingVerse);

  useBrowserLayoutEffect(() => {
    if (!firstVerse) return;

    dispatch(
      setLastReadVerse({
        lastReadVerse: {
          verseKey: firstVerse.verseKey,
          chapterId: String(firstVerse.chapterId),
          page: String(firstVerse.pageNumber),
          hizb: String(firstVerse.hizbNumber),
        },
        chaptersData,
      }),
    );
  }, [firstVerseKey, chaptersData, dispatch, firstVerse]);

  // On plain chapter routes, ensure Redux chapter context matches URL chapter without
  // clobbering in-chapter scroll progress.
  useEffect(() => {
    if (!hasChapterIdInRoute || !urlChapterId || !chaptersData) {
      return;
    }

    const chapterIdFromPayload = firstVerse?.chapterId ? String(firstVerse.chapterId) : undefined;
    if (chapterIdFromPayload && chapterIdFromPayload !== urlChapterId) {
      return;
    }

    const { lastReadVerse } = store.getState().readingTracker;
    const expectedVerseKey = `${urlChapterId}:${normalizedStartingVerse}`;
    const chapterFromVerseKey = lastReadVerse?.verseKey?.split(':')?.[0];
    if ((lastReadVerse?.chapterId || chapterFromVerseKey) === urlChapterId) {
      return;
    }

    const shouldPreserveCurrentVerseKey = chapterFromVerseKey === urlChapterId;

    dispatch(
      setLastReadVerse({
        lastReadVerse: {
          verseKey: shouldPreserveCurrentVerseKey ? lastReadVerse.verseKey : expectedVerseKey,
          chapterId: urlChapterId,
          page: String(firstVerse?.pageNumber ?? lastReadVerse?.page ?? ''),
          hizb: String(firstVerse?.hizbNumber ?? lastReadVerse?.hizb ?? ''),
        },
        chaptersData,
      }),
    );
  }, [
    chaptersData,
    dispatch,
    firstVerse?.chapterId,
    firstVerse?.hizbNumber,
    firstVerse?.pageNumber,
    hasChapterIdInRoute,
    normalizedStartingVerse,
    store,
    urlChapterId,
  ]);
};

export default useSyncChapterPage;
