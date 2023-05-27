import { useCallback, useEffect, useState, useRef } from 'react';

import { useRouter } from 'next/router';
import { VirtuosoHandle } from 'react-virtuoso';

import Verse from '@/types/Verse';
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
 * @param {number} versesPerPage
 */
const useScrollToVirtualizedTranslationView = (
  quranReaderDataType: QuranReaderDataType,
  virtuosoRef: React.MutableRefObject<VirtuosoHandle>,
  apiPageToVersesMap: Record<number, Verse[]>,
  versesPerPage: number,
) => {
  const router = useRouter();
  const [shouldReadjustScroll, setShouldReadjustScroll] = useState(false);

  const { startingVerse } = router.query;
  const startingVerseNumber = Number(startingVerse);
  // if the startingVerse is a valid integer and is above 1
  const isValidStartingVerse =
    startingVerseNumber && Number.isInteger(startingVerseNumber) && startingVerseNumber > 0;

  const scrollToArabicVerse = useCallback(
    (verseNumber: number, done?: () => void) => {
      const verseIndex = verseNumber - 1;
      virtuosoRef.current.scrollToIndex({
        index: verseIndex,
        align: ScrollAlign.Start,
        offset: -70,
      });

      done?.();
    },
    [virtuosoRef],
  );

  useEffect(() => {
    // if startingVerse is present in the url
    if (quranReaderDataType === QuranReaderDataType.Chapter && isValidStartingVerse) {
      scrollToArabicVerse(startingVerseNumber, () => {
        setShouldReadjustScroll(true);
      });
    }
  }, [quranReaderDataType, startingVerseNumber, isValidStartingVerse, scrollToArabicVerse]);

  const oldApiPageToVersesMap = useRef<Record<number, Verse[]>>(apiPageToVersesMap);

  // this effect handles the case when the user navigates to a verse that is not yet loaded
  // we need to wait for the verse to be loaded and then scroll to it
  useEffect(() => {
    if (quranReaderDataType === QuranReaderDataType.Chapter && isValidStartingVerse) {
      const pageNumber = Math.ceil((startingVerseNumber + 1) / versesPerPage);

      const isFirstVerseInPage = (startingVerseNumber + 1) % versesPerPage === 1;
      const isLastVerseInPage = (startingVerseNumber + 1) % versesPerPage === 0;

      const isNewPageLoaded = (page: number) => {
        return !oldApiPageToVersesMap.current[page] && apiPageToVersesMap[page];
      };

      if (shouldReadjustScroll) {
        if (
          isNewPageLoaded(pageNumber) ||
          (pageNumber > 1 && isFirstVerseInPage && isNewPageLoaded(pageNumber - 1)) ||
          (isLastVerseInPage && isNewPageLoaded(pageNumber + 1))
        ) {
          scrollToArabicVerse(startingVerseNumber);
        } else {
          setTimeout(() => {
            scrollToArabicVerse(startingVerseNumber);
          }, 1000);

          setShouldReadjustScroll(false);
        }
      }
    }

    oldApiPageToVersesMap.current = apiPageToVersesMap;
  }, [
    shouldReadjustScroll,
    startingVerseNumber,
    isValidStartingVerse,
    apiPageToVersesMap,
    quranReaderDataType,
    versesPerPage,
    scrollToArabicVerse,
    virtuosoRef,
  ]);
};

export default useScrollToVirtualizedTranslationView;
