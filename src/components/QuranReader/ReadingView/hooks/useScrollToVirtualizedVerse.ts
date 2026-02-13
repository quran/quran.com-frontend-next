import { useCallback, useEffect, useMemo, useRef } from 'react';

import { useRouter } from 'next/router';
import { shallowEqual, useSelector } from 'react-redux';
import { VirtuosoHandle } from 'react-virtuoso';

import scrollToVerseTarget from './scrollToVerseTarget';
import { getStartingVerseTarget, type StartingVerseTarget } from './startingVerseTarget';
import useFetchVersePageNumber from './useFetchVersePageNumber';

import useAudioNavigationScroll from '@/hooks/useAudioNavigationScroll';
import { selectNavbar } from '@/redux/slices/navbar';
import { selectPinnedVerses } from '@/redux/slices/QuranReader/pinnedVerses';
import QuranReaderStyles from '@/redux/types/QuranReaderStyles';
import { MushafLines, QuranFont, QuranReaderDataType } from '@/types/QuranReader';
import { makeVerseKey } from '@/utils/verse';
import { VersesResponse } from 'types/ApiResponses';
import LookupRecord from 'types/LookupRecord';
import Verse from 'types/Verse';

const useScrollToVirtualizedReadingView = (
  quranReaderDataType: QuranReaderDataType,
  virtuosoRef: React.MutableRefObject<VirtuosoHandle>,
  initialData: VersesResponse,
  quranReaderStyles: QuranReaderStyles,
  verses: Verse[],
  pagesVersesRange: Record<number, LookupRecord>,
  isUsingDefaultFont: boolean,
  quranFont: QuranFont,
  mushafLines: MushafLines,
  isPagesLookupLoading: boolean,
) => {
  const router = useRouter();
  const startingVerseQueryParam = router.query.startingVerse;
  const startingVerse = Array.isArray(startingVerseQueryParam)
    ? startingVerseQueryParam[0]
    : startingVerseQueryParam;
  const chapterIdQueryParam = router.query.chapterId;
  const chapterIdFromRoute = Array.isArray(chapterIdQueryParam)
    ? chapterIdQueryParam[0]
    : chapterIdQueryParam;
  const isChapterScopedRoute = !!chapterIdFromRoute && !String(chapterIdFromRoute).includes(':');
  const chapterIdFromLoadedVerses = initialData.verses[0]?.chapterId
    ? String(initialData.verses[0].chapterId)
    : undefined;
  const shouldScroll = useRef(true);

  const pinnedVerses = useSelector(selectPinnedVerses);
  const hasPinnedVerses = pinnedVerses.length > 0;
  const { isVisible: isNavbarVisible } = useSelector(selectNavbar, shallowEqual);

  const fetchVersePageNumber = useFetchVersePageNumber(
    quranReaderStyles.quranFont,
    quranReaderStyles.mushafLines,
  );

  const startingVerseTarget = useMemo(
    () =>
      getStartingVerseTarget({
        startingVerse,
        chapterIdFromLoadedVerses,
        isChapterScopedRoute,
      }),
    [startingVerse, chapterIdFromLoadedVerses, isChapterScopedRoute],
  );

  useEffect(() => {
    // Re-enable scroll when font, mushaf lines, or starting verse changes.
    shouldScroll.current = true;
  }, [quranFont, mushafLines, startingVerse]);

  const scrollToVerse = useCallback(
    async (target: StartingVerseTarget, respectScrollGuard = false) => {
      if (respectScrollGuard && shouldScroll.current === false) return;
      const didScroll = await scrollToVerseTarget({
        target,
        virtuosoRef,
        pagesVersesRange,
        verses,
        isUsingDefaultFont,
        initialDataFirstPage: initialData.verses[0]?.pageNumber,
        hasPinnedVerses,
        isNavbarVisible,
        fetchVersePageNumber,
      });
      if (respectScrollGuard && didScroll) shouldScroll.current = false;
    },
    [
      virtuosoRef,
      pagesVersesRange,
      verses,
      isUsingDefaultFont,
      initialData.verses,
      hasPinnedVerses,
      isNavbarVisible,
      fetchVersePageNumber,
    ],
  );

  useEffect(() => {
    if (!isPagesLookupLoading && virtuosoRef.current && Object.keys(pagesVersesRange).length) {
      if (!startingVerseTarget) return;
      if (
        quranReaderDataType === QuranReaderDataType.Chapter &&
        startingVerseTarget.isChapterNumericFormat &&
        startingVerseTarget.verseNumber <= 1 // Skip if verse 1 is already visible at the top in chapter mode.
      ) {
        return;
      }
      // Trigger initial scroll for both chapter and multi-surah target formats.
      scrollToVerse(startingVerseTarget, true);
    }
  }, [
    isPagesLookupLoading,
    quranReaderDataType,
    startingVerseTarget,
    virtuosoRef,
    scrollToVerse,
    pagesVersesRange,
  ]);

  const onAudioNavigationScroll = useCallback(
    (ayahNumber: number) => {
      if (!chapterIdFromLoadedVerses) return;
      scrollToVerse(
        {
          chapterId: chapterIdFromLoadedVerses,
          verseNumber: ayahNumber,
          verseKey: makeVerseKey(chapterIdFromLoadedVerses, ayahNumber),
          isChapterNumericFormat: true,
        },
        false,
      );
    },
    [chapterIdFromLoadedVerses, scrollToVerse],
  );

  // Subscribe to NEXT_AYAH and PREV_AYAH events to keep audio navigation behavior unchanged.
  useAudioNavigationScroll(
    quranReaderDataType,
    chapterIdFromLoadedVerses || '',
    onAudioNavigationScroll,
  );
};

export default useScrollToVirtualizedReadingView;
