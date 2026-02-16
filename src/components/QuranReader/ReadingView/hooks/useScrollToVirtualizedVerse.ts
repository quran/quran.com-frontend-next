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
import { normalizeQueryParam } from '@/utils/url';
import { makeVerseKey } from '@/utils/verse';
import { VersesResponse } from 'types/ApiResponses';
import LookupRecord from 'types/LookupRecord';
import Verse from 'types/Verse';

/**
 * This hook listens to startingVerse query param and navigate to the
 * location where the page of that verse is in the virtualized list if we
 * already have the data of that verse; otherwise, we will call BE to fetch
 * the page number of the verse we want to navigate to.
 *
 * [NOTE]: This is meant to be used by ReadingView only.
 *
 * @param {QuranReaderDataType} quranReaderDataType
 * @param {React.MutableRefObject<VirtuosoHandle>} virtuosoRef
 * @param {VersesResponse} initialData
 * @param {QuranReaderStyles} quranReaderStyles
 * @param {Verse[]} verses
 * @param {Record<number, LookupRecord>} pagesVersesRange
 * @param {boolean} isUsingDefaultFont
 * @param {QuranFont} quranFont
 * @param {MushafLines} mushafLines
 * @param {boolean} isPagesLookupLoading
 */
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
  const startingVerse = normalizeQueryParam(router.query.startingVerse);
  const chapterIdFromRoute = normalizeQueryParam(router.query.chapterId);
  const isChapterScopedRoute = !!chapterIdFromRoute && !String(chapterIdFromRoute).includes(':');
  const chapterIdFromLoadedVerses = initialData.verses[0]?.chapterId
    ? String(initialData.verses[0].chapterId)
    : undefined;
  const shouldScroll = useRef(true);

  const pinnedVerses = useSelector(selectPinnedVerses);
  const hasPinnedVerses = pinnedVerses.length > 0;
  const { isVisible: isNavbarVisible } = useSelector(selectNavbar, shallowEqual);
  const hasPinnedVersesRef = useRef(hasPinnedVerses);
  hasPinnedVersesRef.current = hasPinnedVerses;
  const isNavbarVisibleRef = useRef(isNavbarVisible);
  isNavbarVisibleRef.current = isNavbarVisible;

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

  /**
   * We need to scroll again when we have just changed the font since the same
   * verse might lie on another page/position. Same for when we change the
   * verse.
   */
  useEffect(() => {
    // Re-enable scroll when font, mushaf lines, or starting verse changes.
    shouldScroll.current = true;
  }, [quranFont, mushafLines, startingVerse]);

  /**
   * Helper: scroll to a verse target. This consolidates the logic used in
   * both the initial startingVerse effect and the audio player subscription.
   *
   * @param {StartingVerseTarget} target
   * @param {boolean} respectScrollGuard - when true, guard scrolling with shouldScroll ref
   */
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
        hasPinnedVerses: hasPinnedVersesRef.current,
        isNavbarVisible: isNavbarVisibleRef.current,
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
      fetchVersePageNumber,
    ],
  );

  useEffect(() => {
    // If we have the page lookup data and virtuoso is mounted.
    if (!isPagesLookupLoading && virtuosoRef.current && Object.keys(pagesVersesRange).length) {
      // If startingVerse is present in the URL (chapter format or multi-surah format).
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
  useAudioNavigationScroll(quranReaderDataType, onAudioNavigationScroll, chapterIdFromLoadedVerses);
};

export default useScrollToVirtualizedReadingView;
