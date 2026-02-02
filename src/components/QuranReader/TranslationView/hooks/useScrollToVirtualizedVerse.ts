import { useCallback, useEffect, useState, useContext, useRef } from 'react';

import { useRouter } from 'next/router';
import { shallowEqual, useSelector } from 'react-redux';
import { VirtuosoHandle } from 'react-virtuoso';

import { useVerseTrackerContext } from '../../contexts/VerseTrackerContext';

import DataContext from '@/contexts/DataContext';
import useAudioNavigationScroll from '@/hooks/useAudioNavigationScroll';
import { selectNavbar } from '@/redux/slices/navbar';
import { selectPinnedVerses } from '@/redux/slices/QuranReader/pinnedVerses';
import { QuranReaderDataType } from '@/types/QuranReader';
import Verse from '@/types/Verse';
import { getPageNumberFromIndexAndPerPage } from '@/utils/number';
import { isValidVerseId } from '@/utils/validator';
import { makeVerseKey } from '@/utils/verse';
import ScrollAlign from 'types/ScrollAlign';

const SCROLL_DELAY_MS = 1000;
const CONTEXT_MENU_OFFSET = -70;
const PINNED_VERSES_BAR_OFFSET = -90;
const NAVBAR_OFFSET = -54;

/**
 * This hook listens to startingVerse query param and navigate to
 * the location where the verse is in the virtualized list.
 *
 * [NOTE]: This is meant to be used for TranslationView only.
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

  const pinnedVerses = useSelector(selectPinnedVerses);
  const hasPinnedVerses = pinnedVerses.length > 0;
  const { isVisible: isNavbarVisible } = useSelector(selectNavbar, shallowEqual);

  const { startingVerse } = router.query;
  const startingVerseNumber = Number(startingVerse);
  const isValidStartingVerse =
    startingVerse && isValidVerseId(chaptersData, chapterId, String(startingVerse));

  const scrollToBeginningOfVerseCell = useCallback(
    (verseNumber: number) => {
      if (!virtuosoRef.current) return;
      const verseIndex = verseNumber - 1;
      let offset = CONTEXT_MENU_OFFSET;
      if (hasPinnedVerses) {
        offset += PINNED_VERSES_BAR_OFFSET;
        if (isNavbarVisible) offset += NAVBAR_OFFSET;
      }
      virtuosoRef.current.scrollToIndex({
        index: verseIndex,
        align: ScrollAlign.Start,
        offset,
      });
    },
    [virtuosoRef, hasPinnedVerses, isNavbarVisible],
  );

  useEffect(() => {
    if (
      quranReaderDataType === QuranReaderDataType.Chapter &&
      isValidStartingVerse &&
      startingVerseNumber > 1
    ) {
      scrollToBeginningOfVerseCell(startingVerseNumber);
      setShouldReadjustScroll(true);
    }
  }, [
    quranReaderDataType,
    startingVerseNumber,
    isValidStartingVerse,
    scrollToBeginningOfVerseCell,
  ]);

  useEffect(() => {
    if (
      quranReaderDataType === QuranReaderDataType.Chapter &&
      isValidStartingVerse &&
      startingVerseNumber > 1 &&
      shouldReadjustScroll
    ) {
      shouldTrackObservedVerses.current = false;
      const pageNumber = getPageNumberFromIndexAndPerPage(startingVerseNumber - 1, versesPerPage);
      const isFirstVerseInPage = startingVerseNumber % versesPerPage === 1;

      const isBeforeDoneLoading =
        pageNumber > 1 && isFirstVerseInPage ? !!apiPageToVersesMap[pageNumber - 1] : true;
      const isDoneLoading = !!apiPageToVersesMap[pageNumber] && isBeforeDoneLoading;

      if (isDoneLoading) {
        if (timeoutId.current !== null) {
          clearTimeout(timeoutId.current);
        }

        timeoutId.current = setTimeout(() => {
          scrollToBeginningOfVerseCell(startingVerseNumber);
          shouldTrackObservedVerses.current = true;
          verseKeysQueue.current.add(makeVerseKey(chapterId, startingVerseNumber));
        }, SCROLL_DELAY_MS);

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

  useAudioNavigationScroll(quranReaderDataType, chapterId, scrollToBeginningOfVerseCell);

  useEffect(() => {
    return () => {
      if (timeoutId.current !== null) {
        clearTimeout(timeoutId.current);
      }
    };
  }, []);
};

export default useScrollToVirtualizedTranslationView;
