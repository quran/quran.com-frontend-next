import { useCallback, useEffect, useRef } from 'react';

import { useRouter } from 'next/router';
import { shallowEqual, useSelector } from 'react-redux';
import { VirtuosoHandle } from 'react-virtuoso';

import useFetchVersePageNumber from './useFetchVersePageNumber';

import useAudioNavigationScroll from '@/hooks/useAudioNavigationScroll';
import { selectNavbar } from '@/redux/slices/navbar';
import { selectPinnedVerses } from '@/redux/slices/QuranReader/pinnedVerses';
import QuranReaderStyles from '@/redux/types/QuranReaderStyles';
import { MushafLines, QuranFont, QuranReaderDataType } from '@/types/QuranReader';
import { getVersePositionWithinAMushafPage } from '@/utils/verse';
import { VersesResponse } from 'types/ApiResponses';
import LookupRecord from 'types/LookupRecord';
import Verse from 'types/Verse';

const PINNED_VERSES_BAR_OFFSET = -90;
const NAVBAR_OFFSET = -54;

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
  const { startingVerse, chapterId } = router.query;
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
    async (verseNumber: number, respectScrollGuard = false) => {
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

      const startFromVerseData = verses.find((verse) => verse.verseNumber === verseNumber);
      if (startFromVerseData && pagesVersesRange[startFromVerseData.pageNumber]) {
        const scrollToPageIndex = startFromVerseData.pageNumber - firstPageOfCurrentChapter;
        virtuosoRef.current.scrollToIndex({
          index: scrollToPageIndex,
          align: getVersePositionWithinAMushafPage(
            `${chapterId}:${verseNumber}`,
            pagesVersesRange[startFromVerseData.pageNumber],
          ),
          offset: pinnedOffset,
        });
        if (respectScrollGuard) shouldScroll.current = false;
        return;
      }

      const response = await fetchVersePageNumber(chapterId as string, verseNumber);
      if (!response || !virtuosoRef.current) return;
      if (response.verses.length && (respectScrollGuard ? shouldScroll.current === true : true)) {
        const page = response.verses[0].pageNumber;
        const scrollToPageIndex = page - firstPageOfCurrentChapter;
        if (pagesVersesRange[page]) {
          virtuosoRef.current.scrollToIndex({
            index: scrollToPageIndex,
            align: getVersePositionWithinAMushafPage(
              `${chapterId}:${verseNumber}`,
              pagesVersesRange[page],
            ),
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
      chapterId,
      fetchVersePageNumber,
    ],
  );

  useEffect(() => {
    // if we have the data of the page lookup
    if (!isPagesLookupLoading && virtuosoRef.current && Object.keys(pagesVersesRange).length) {
      // if startingVerse is present in the url
      if (quranReaderDataType === QuranReaderDataType.Chapter && startingVerse) {
        const startingVerseNumber = Number(startingVerse);
        // if the startingVerse is a valid integer and is above 1 (skip verse 1 since it's already at the top)
        if (Number.isInteger(startingVerseNumber) && startingVerseNumber > 1) {
          scrollToVerse(startingVerseNumber, true);
        }
      }
    }
  }, [
    isPagesLookupLoading,
    quranReaderDataType,
    startingVerse,
    virtuosoRef,
    scrollToVerse,
    pagesVersesRange,
  ]);

  // Subscribe to NEXT_AYAH and PREV_AYAH events to scroll when user clicks buttons in audio player
  useAudioNavigationScroll(quranReaderDataType, chapterId as string, scrollToVerse);
};

export default useScrollToVirtualizedReadingView;
