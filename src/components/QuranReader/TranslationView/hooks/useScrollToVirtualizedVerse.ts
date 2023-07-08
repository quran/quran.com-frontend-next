import { useCallback, useEffect, useState, useContext, useRef } from 'react';

import { useRouter } from 'next/router';
import { VirtuosoHandle } from 'react-virtuoso';

import { useVerseTrackerContext } from '../../contexts/VerseTrackerContext';

import DataContext from '@/contexts/DataContext';
import Verse from '@/types/Verse';
import { getPageNumberFromIndexAndPerPage } from '@/utils/number';
import { isValidVerseId } from '@/utils/validator';
import { makeVerseKey } from '@/utils/verse';
import { QuranReaderDataType } from 'types/QuranReader';
import ScrollAlign from 'types/ScrollAlign';

/**
 * This hook listens to startingVerse query param and navigate to
 * the location where the verse is in the virtualized list.
 *
 * [NOTE]: This is meant to be used for TranslationView only.
 *
 * @param {QuranReaderDataType} quranReaderDataType
 * @param {React.MutableRefObject<VirtuosoHandle>} virtuosoRef
 * @param {Record<number, Verse[]>} apiPageToVersesMap
 * @param {string} chapterId
 * @param {number} versesPerPage
 */
const useScrollToVirtualizedTranslationView = (
  quranReaderDataType: QuranReaderDataType,
  virtuosoRef: React.MutableRefObject<VirtuosoHandle>,
  apiPageToVersesMap: Record<number, Verse[]>,
  chapterId: string,
  versesPerPage: number,
) => {
  const router = useRouter();
  const chaptersData = useContext(DataContext);
  const [shouldReadjustScroll, setShouldReadjustScroll] = useState(false);
  const timeoutId = useRef<ReturnType<typeof setTimeout>>(null);
  const { verseKeysQueue, shouldTrackObservedVerses } = useVerseTrackerContext();

  const { startingVerse } = router.query;
  const startingVerseNumber = Number(startingVerse);
  const isValidStartingVerse =
    startingVerse && isValidVerseId(chaptersData, chapterId, String(startingVerse));

  const scrollToBeginningOfVerseCell = useCallback(
    (verseNumber: number) => {
      const verseIndex = verseNumber - 1;
      virtuosoRef.current.scrollToIndex({
        index: verseIndex,
        align: ScrollAlign.Start,
        // this offset is to push the scroll a little bit down so that the context menu doesn't cover the verse
        offset: -70,
      });
    },
    [virtuosoRef],
  );

  // this effect runs when there is initially a `startingVerse` in the url or when the user navigates to a new verse
  // it scrolls to the beginning of the verse cell and we set `shouldReadjustScroll` to true so that the other effect
  // adjusts the scroll to the correct position
  useEffect(() => {
    if (quranReaderDataType === QuranReaderDataType.Chapter && isValidStartingVerse) {
      scrollToBeginningOfVerseCell(startingVerseNumber);
      setShouldReadjustScroll(true);
    }
  }, [
    quranReaderDataType,
    startingVerseNumber,
    isValidStartingVerse,
    scrollToBeginningOfVerseCell,
  ]);

  // this effect handles the case when the user navigates to a verse that is not yet loaded
  // we need to wait for the verse to be loaded and then scroll to it
  useEffect(() => {
    if (
      quranReaderDataType === QuranReaderDataType.Chapter &&
      isValidStartingVerse &&
      // we only want to run this effect when the user navigates to a new verse
      // and not when the user is scrolling through the verses while apiPageToVersesMap is being populated
      shouldReadjustScroll
    ) {
      shouldTrackObservedVerses.current = false;
      const pageNumber = getPageNumberFromIndexAndPerPage(startingVerseNumber - 1, versesPerPage);
      const isFirstVerseInPage = startingVerseNumber % versesPerPage === 1;

      const isBeforeDoneLoading =
        pageNumber > 1 && isFirstVerseInPage ? !!apiPageToVersesMap[pageNumber - 1] : true;
      const isDoneLoading = !!apiPageToVersesMap[pageNumber] && isBeforeDoneLoading;

      // if the verse finished loading, or the one right before, we `setTimeout` and scroll to the beginning of the verse cell (this is a hacky solution so that the verse renders before we scroll to it)
      // and set `shouldReadjustScroll` to false so that this effect doesn't run again
      //
      // otherwise, we use `scrollToBeginningOfVerseCell` to scroll near the beginning of the verse cell without setting `shouldReadjustScroll` to false so that this effect runs again when the data loads
      if (isDoneLoading) {
        if (timeoutId.current !== null) {
          clearTimeout(timeoutId.current);
        }

        timeoutId.current = setTimeout(() => {
          scrollToBeginningOfVerseCell(startingVerseNumber);
          shouldTrackObservedVerses.current = true;

          // we need to add the verse we scrolled to to the queue
          verseKeysQueue.current.add(makeVerseKey(chapterId, startingVerseNumber));
        }, 1000);

        setShouldReadjustScroll(false);
      } else {
        scrollToBeginningOfVerseCell(startingVerseNumber);
      }
    }
  }, [
    shouldReadjustScroll,
    startingVerseNumber,
    isValidStartingVerse,
    apiPageToVersesMap,
    quranReaderDataType,
    versesPerPage,
    scrollToBeginningOfVerseCell,
    virtuosoRef,
    shouldTrackObservedVerses,
    verseKeysQueue,
    chapterId,
  ]);

  // this effect clears the timeout when the component unmounts
  useEffect(() => {
    return () => {
      if (timeoutId.current !== null) {
        clearTimeout(timeoutId.current);
      }
    };
  }, []);
};

export default useScrollToVirtualizedTranslationView;
