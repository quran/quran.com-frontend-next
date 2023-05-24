import { useEffect, useRef } from 'react';

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
  const { startingVerse } = router.query;
  const startingVerseNumber = Number(startingVerse);
  // if the startingVerse is a valid integer and is above 1
  const isValidStartingVerse =
    startingVerseNumber && Number.isInteger(startingVerseNumber) && startingVerseNumber > 0;

  useEffect(() => {
    // if startingVerse is present in the url
    if (quranReaderDataType === QuranReaderDataType.Chapter && isValidStartingVerse) {
      virtuosoRef.current.scrollToIndex({
        index: startingVerseNumber - 1,
        align: ScrollAlign.Center,
      });
    }
  }, [quranReaderDataType, startingVerseNumber, isValidStartingVerse, virtuosoRef]);

  const oldApiPageToVersesMap = useRef<Record<number, Verse[]>>(apiPageToVersesMap);

  // this effect handles the case when the user navigates to a verse that is not yet loaded
  // we need to wait for the verse to be loaded and then scroll to it
  useEffect(() => {
    if (quranReaderDataType === QuranReaderDataType.Chapter && isValidStartingVerse) {
      const pageNumber = Math.ceil((startingVerseNumber + 1) / versesPerPage);
      if (!oldApiPageToVersesMap.current[pageNumber] && apiPageToVersesMap[pageNumber]) {
        // scroll on the next tick so that the verse is rendered
        setTimeout(() => {
          virtuosoRef.current.scrollIntoView({
            index: startingVerseNumber - 1,
            align: ScrollAlign.Center,
          });
        }, 0);
        oldApiPageToVersesMap.current = apiPageToVersesMap;
      }
    }
  }, [
    startingVerseNumber,
    isValidStartingVerse,
    apiPageToVersesMap,
    quranReaderDataType,
    versesPerPage,
    virtuosoRef,
  ]);
};

export default useScrollToVirtualizedTranslationView;
