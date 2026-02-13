/* eslint-disable max-lines */
import { useCallback, useEffect, useMemo, useRef } from 'react';

import { useRouter } from 'next/router';
import { shallowEqual, useSelector } from 'react-redux';
import { VirtuosoHandle } from 'react-virtuoso';

import useFetchVersePageNumber from './useFetchVersePageNumber';

import useAudioNavigationScroll from '@/hooks/useAudioNavigationScroll';
import { selectNavbar } from '@/redux/slices/navbar';
import { selectPinnedVerses } from '@/redux/slices/QuranReader/pinnedVerses';
import QuranReaderStyles from '@/redux/types/QuranReaderStyles';
import { MushafLines, QuranFont, QuranReaderDataType } from '@/types/QuranReader';
import {
  getVerseAndChapterNumbersFromKey,
  getVersePositionWithinAMushafPage,
  makeVerseKey,
} from '@/utils/verse';
import { VersesResponse } from 'types/ApiResponses';
import LookupRecord from 'types/LookupRecord';
import ScrollAlign from 'types/ScrollAlign';
import Verse from 'types/Verse';

const PINNED_VERSES_BAR_OFFSET = -90;
const NAVBAR_OFFSET = -54;

type StartingVerseTarget = {
  // Keep parsed starting-verse data in one object to reuse in initial scroll and fetch fallback paths.
  chapterId: string;
  verseNumber: number;
  verseKey: string;
  isChapterNumericFormat: boolean;
};

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

  const hasPinnedVersesRef = useRef(hasPinnedVerses);
  hasPinnedVersesRef.current = hasPinnedVerses;
  const isNavbarVisibleRef = useRef(isNavbarVisible);
  isNavbarVisibleRef.current = isNavbarVisible;

  const fetchVersePageNumber = useFetchVersePageNumber(
    quranReaderStyles.quranFont,
    quranReaderStyles.mushafLines,
  );

  const startingVerseTarget = useMemo<StartingVerseTarget | null>(() => {
    // Parse startingVerse into a normalized target that supports both V and SS:VV formats.
    if (!startingVerse) return null;
    const startingVerseValue = String(startingVerse);
    if (startingVerseValue.includes(':')) {
      // Handle the  multi-surah key format (SS:VV).
      const [targetChapterId, targetVerseNumber] =
        getVerseAndChapterNumbersFromKey(startingVerseValue);
      const parsedChapterId = Number(targetChapterId);
      const parsedVerseNumber = Number(targetVerseNumber);
      if (!Number.isInteger(parsedChapterId) || parsedChapterId <= 0) return null; // Reject invalid chapter ids.
      if (!Number.isInteger(parsedVerseNumber) || parsedVerseNumber <= 0) return null; // Reject invalid verse numbers.
      return {
        chapterId: String(parsedChapterId),
        verseNumber: parsedVerseNumber,
        verseKey: makeVerseKey(parsedChapterId, parsedVerseNumber),
        isChapterNumericFormat: false, // Mark as key format.
      };
    }
    const parsedVerseNumber = Number(startingVerseValue); // Parse numeric chapter format (V).
    if (!isChapterScopedRoute) return null; // Ignore numeric format on multi-surah routes because chapter context is ambiguous there.
    if (!chapterIdFromLoadedVerses) return null;
    if (!Number.isInteger(parsedVerseNumber) || parsedVerseNumber <= 0) return null; // Reject invalid verse numbers.
    return {
      chapterId: chapterIdFromLoadedVerses,
      verseNumber: parsedVerseNumber,
      verseKey: makeVerseKey(chapterIdFromLoadedVerses, parsedVerseNumber),
      isChapterNumericFormat: true,
    };
  }, [startingVerse, chapterIdFromLoadedVerses, isChapterScopedRoute]);

  /**
   * We need to scroll again when we have just changed the font since the same
   * verse might lie on another page/position. Same for when we change the
   * verse.
   */
  useEffect(() => {
    shouldScroll.current = true;
  }, [quranFont, mushafLines, startingVerse]);

  /**
   * Helper: scroll to a verse number. This consolidates the logic used in
   * both the initial startingVerse effect and the audio player subscription.
   *
   * @param {number} verseNumber
   * @param {boolean} respectScrollGuard - when true, guard scrolling with shouldScroll ref
   */
  const scrollToVerse = useCallback(
    // eslint-disable-next-line react-func/max-lines-per-function
    async (target: StartingVerseTarget, respectScrollGuard = false) => {
      if (respectScrollGuard && shouldScroll.current === false) return;
      if (!virtuosoRef.current || !Object.keys(pagesVersesRange).length) return;

      let pinnedOffset = 0;
      if (hasPinnedVersesRef.current) {
        pinnedOffset += PINNED_VERSES_BAR_OFFSET;
        if (isNavbarVisibleRef.current) pinnedOffset += NAVBAR_OFFSET;
      }

      const initialDataFirstPage = initialData.verses[0]?.pageNumber;
      const firstPageOfCurrentChapter =
        isUsingDefaultFont && initialDataFirstPage
          ? initialDataFirstPage
          : Number(Object.keys(pagesVersesRange)[0]);

      const startFromVerseData = verses.find(
        (verse) =>
          verse.chapterId === Number(target.chapterId) && verse.verseNumber === target.verseNumber, // Match by chapter + verse so multi-surah targets resolve correctly.
      );
      if (startFromVerseData && pagesVersesRange[startFromVerseData.pageNumber]) {
        const scrollToPageIndex = startFromVerseData.pageNumber - firstPageOfCurrentChapter;
        const align = target.isChapterNumericFormat
          ? getVersePositionWithinAMushafPage(
              target.verseKey,
              pagesVersesRange[startFromVerseData.pageNumber],
            )
          : ScrollAlign.Center;
        virtuosoRef.current.scrollToIndex({
          index: scrollToPageIndex,
          align,
          offset: pinnedOffset,
        });
        if (respectScrollGuard) shouldScroll.current = false;
        return;
      }

      const response = await fetchVersePageNumber(target.chapterId, target.verseNumber);
      if (!response || !virtuosoRef.current) return;
      if (response.verses.length && (respectScrollGuard ? shouldScroll.current === true : true)) {
        const page = response.verses[0].pageNumber;
        const scrollToPageIndex = page - firstPageOfCurrentChapter;
        if (pagesVersesRange[page]) {
          const align = target.isChapterNumericFormat
            ? getVersePositionWithinAMushafPage(target.verseKey, pagesVersesRange[page])
            : ScrollAlign.Center;
          virtuosoRef.current.scrollToIndex({
            index: scrollToPageIndex,
            align,
            offset: pinnedOffset,
          });

          if (respectScrollGuard) shouldScroll.current = false;
        }
      }
    },
    [
      virtuosoRef,
      pagesVersesRange,
      isUsingDefaultFont,
      initialData.verses,
      verses,
      fetchVersePageNumber,
    ],
  );

  useEffect(() => {
    // if we have the data of the page lookup
    if (!isPagesLookupLoading && virtuosoRef.current && Object.keys(pagesVersesRange).length) {
      if (!startingVerseTarget) return;
      if (
        quranReaderDataType === QuranReaderDataType.Chapter &&
        startingVerseTarget.isChapterNumericFormat &&
        startingVerseTarget.verseNumber <= 1 // skip if verse 1 is already visible at top in chapter mode.
      ) {
        return;
      }
      scrollToVerse(startingVerseTarget, true); // Trigger initial scroll for both chapter and multi-surah target formats.
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

  // Subscribe to NEXT_AYAH and PREV_AYAH events to scroll when user clicks buttons in audio player
  useAudioNavigationScroll(
    quranReaderDataType,
    chapterIdFromLoadedVerses || '',
    onAudioNavigationScroll,
  );
};

export default useScrollToVirtualizedReadingView;
