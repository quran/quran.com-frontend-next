import { useEffect, useRef, useContext, useCallback } from 'react';

import { useRouter } from 'next/router';
import { VirtuosoHandle } from 'react-virtuoso';

import QuranReaderStyles from '@/redux/types/QuranReaderStyles';
import { MushafLines, QuranFont, QuranReaderDataType } from '@/types/QuranReader';
import { getMushafId } from '@/utils/api';
import { makeVersesFilterUrl } from '@/utils/apiPaths';
import { getVerseNumberFromKey } from '@/utils/verse';
import { AudioPlayerMachineContext } from '@/xstate/AudioPlayerMachineContext';
import { fetcher } from 'src/api';
import { VersesResponse } from 'types/ApiResponses';
import LookupRecord from 'types/LookupRecord';
import ScrollAlign from 'types/ScrollAlign';
import Verse from 'types/Verse';

/**
 * Get where a verse lies in a mushaf page. This is achieved by:
 *
 * 1. Checking where the index of the current verse is within the page.
 * 2. Calculating how far the index is from the beginning of the array of verses of that page.
 * 3. If it lies in the first third portion, then its position is 'start', the second
 *    third of the page, its position is 'center', the last third of the page its position
 *    is 'end'.
 *
 * @param {string} startingVerseKey
 * @param {number} mushafPageNumber
 * @param {Record<number, LookupRecord>} pagesVersesRange
 * @returns {ScrollAlign}
 */
const getVersePositionWithinAMushafPage = (
  startingVerseKey: string,
  mushafPageNumber: number,
  pagesVersesRange: Record<number, LookupRecord>,
): ScrollAlign => {
  const pageStartVerseNumber = getVerseNumberFromKey(pagesVersesRange[mushafPageNumber].from);
  const pageEndVerseNumber = getVerseNumberFromKey(pagesVersesRange[mushafPageNumber].to);
  const verseOrderWithinPage = getVerseNumberFromKey(startingVerseKey) - pageStartVerseNumber + 1;
  const totalPageNumberOfVerses = pageEndVerseNumber - pageStartVerseNumber + 1;
  const verseKeyPosition = (verseOrderWithinPage * 100) / totalPageNumberOfVerses;
  if (verseKeyPosition <= 33.3) {
    return ScrollAlign.Start;
  }
  if (verseKeyPosition <= 66.6) {
    return ScrollAlign.Center;
  }
  return ScrollAlign.End;
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
  const { startingVerse, chapterId } = router.query;
  const shouldScroll = useRef(true);

  // Ref to hold latest AbortController so we can cancel stale requests
  const abortControllerRef = useRef<AbortController | null>(null);

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
   * @param {boolean} useShouldScroll - when true, guard scrolling with shouldScroll ref
   */
  const scrollToVerse = useCallback(
    // eslint-disable-next-line react-func/max-lines-per-function
    (verseNumber: number, useShouldScroll = false) => {
      if (useShouldScroll && shouldScroll.current === false) return;
      if (!virtuosoRef.current || !Object.keys(pagesVersesRange).length) return;

      const firstPageOfCurrentChapter = isUsingDefaultFont
        ? initialData.verses[0].pageNumber
        : Number(Object.keys(pagesVersesRange)[0]);

      const startFromVerseData = verses.find((verse) => verse.verseNumber === verseNumber);

      if (startFromVerseData && pagesVersesRange[startFromVerseData.pageNumber]) {
        const scrollToPageIndex = startFromVerseData.pageNumber - firstPageOfCurrentChapter;
        virtuosoRef.current.scrollToIndex({
          index: scrollToPageIndex,
          align: getVersePositionWithinAMushafPage(
            `${chapterId}:${verseNumber}`,
            startFromVerseData.pageNumber,
            pagesVersesRange,
          ),
        });
        if (useShouldScroll) shouldScroll.current = false;
        return;
      }

      // Abort previous request (if any) to prevent race conditions
      if (abortControllerRef.current) abortControllerRef.current.abort();

      const controller = new AbortController();
      abortControllerRef.current = controller;

      // fallback: fetch page number for the verse and scroll if possible
      fetcher(
        makeVersesFilterUrl({
          filters: `${chapterId}:${verseNumber}`,
          fields: `page_number`,
          ...getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines),
        }),
        { signal: controller.signal },
      )
        .then((response: VersesResponse) => {
          if (response.verses.length && (useShouldScroll ? shouldScroll.current === true : true)) {
            const page = response.verses[0].pageNumber;
            const scrollToPageIndex = page - firstPageOfCurrentChapter;
            if (pagesVersesRange[page]) {
              virtuosoRef.current.scrollToIndex({
                index: scrollToPageIndex,
                align: getVersePositionWithinAMushafPage(
                  `${chapterId}:${verseNumber}`,
                  page,
                  pagesVersesRange,
                ),
              });

              if (useShouldScroll) shouldScroll.current = false;
            }
          }
        })
        .catch(() => {
          // Ignore errors
        });
    },
    [
      virtuosoRef,
      pagesVersesRange,
      isUsingDefaultFont,
      initialData,
      verses,
      chapterId,
      quranReaderStyles,
    ],
  );

  useEffect(() => {
    // if we have the data of the page lookup
    if (!isPagesLookupLoading && virtuosoRef.current && Object.keys(pagesVersesRange).length) {
      // if startingVerse is present in the url
      if (quranReaderDataType === QuranReaderDataType.Chapter && startingVerse) {
        const startingVerseNumber = Number(startingVerse);
        // if the startingVerse is a valid integer and is above 1
        if (Number.isInteger(startingVerseNumber) && startingVerseNumber > 0) {
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

  const audioService = useContext(AudioPlayerMachineContext);

  // Subscribe to NEXT_AYAH and PREV_AYAH events to scroll when user clicks buttons in audio player
  useEffect(() => {
    if (!audioService || quranReaderDataType !== QuranReaderDataType.Chapter) return undefined;

    const subscription = audioService.subscribe((state) => {
      if (state.event.type === 'NEXT_AYAH' || state.event.type === 'PREV_AYAH') {
        const { ayahNumber } = state.context;
        if (!Number.isInteger(ayahNumber) || ayahNumber <= 0) return;
        scrollToVerse(ayahNumber, false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [audioService, scrollToVerse, quranReaderDataType]);
};

export default useScrollToVirtualizedReadingView;
