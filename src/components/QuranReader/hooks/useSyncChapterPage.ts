import { useContext, useEffect } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import DataContext from '@/contexts/DataContext';
import useBrowserLayoutEffect from '@/hooks/useBrowserLayoutEffect';
import useChapterIdsByUrlPath from '@/hooks/useChapterId';
import {
  selectLastReadVerseKey,
  setLastReadVerse,
} from '@/redux/slices/QuranReader/readingTracker';
import { normalizeQueryParam } from '@/utils/url';
import { VersesResponse } from 'types/ApiResponses';

const getNormalizedStartingVerse = (startingVerse: string | string[]): number => {
  const parsedStartingVerse = Number(normalizeQueryParam(startingVerse));
  return Number.isNaN(parsedStartingVerse) || parsedStartingVerse < 1 ? 1 : parsedStartingVerse;
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
 * - On chapter routes (`/S`), we also align chapter context with the URL (and `startingVerse`
 *   when needed) without clobbering in-chapter scroll progress.
 *
 * @param {VersesResponse} initialData - The initial verses data from the page
 */
const useSyncChapterPage = (initialData: VersesResponse): void => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { lang } = useTranslation('common');
  const chaptersData = useContext(DataContext);
  const lastReadVerse = useSelector(selectLastReadVerseKey, shallowEqual);
  const hasChapterIdInRoute = Boolean(router.query.chapterId);
  const chapterIdsByUrlPath = useChapterIdsByUrlPath(lang);
  const urlChapterId = hasChapterIdInRoute ? chapterIdsByUrlPath?.[0] : undefined;

  const firstVerse = initialData?.verses?.[0];
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

  // On /S routes, ensure Redux chapter context matches URL chapter without clobbering in-chapter scroll progress.
  useEffect(() => {
    if (!hasChapterIdInRoute || !urlChapterId || !chaptersData) {
      return;
    }

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
    firstVerse?.hizbNumber,
    firstVerse?.pageNumber,
    hasChapterIdInRoute,
    lastReadVerse?.chapterId,
    lastReadVerse?.hizb,
    lastReadVerse?.page,
    lastReadVerse?.verseKey,
    normalizedStartingVerse,
    urlChapterId,
  ]);
};

export default useSyncChapterPage;
