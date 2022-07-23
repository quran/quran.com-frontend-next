import { useEffect } from 'react';

import { useRouter } from 'next/router';
import { VirtuosoHandle } from 'react-virtuoso';

import { verseIndexToApiPageNumber } from 'src/components/QuranReader/utils/page';
import { QuranReaderDataType } from 'types/QuranReader';
import ScrollAlign from 'types/ScrollAlign';

const getVersePositionWithinAPage = (
  startingVerseNumber: number,
  versesPerPage: number,
  scrollToPageNumber: number,
): ScrollAlign => {
  const pageStartVerseNumber =
    scrollToPageNumber === 1
      ? scrollToPageNumber
      : scrollToPageNumber * versesPerPage - versesPerPage;
  const verseOrderWithinPage = startingVerseNumber - pageStartVerseNumber + 1;
  const verseKeyPosition = (verseOrderWithinPage * 100) / versesPerPage;
  if (verseKeyPosition <= 33.3) {
    return ScrollAlign.Start;
  }
  if (verseKeyPosition <= 66.6) {
    return ScrollAlign.Center;
  }
  return ScrollAlign.End;
};

/**
 * This hook listens to startingVerse query param and navigate to
 * the location where the verse is in the virtualized list.
 *
 * [NOTE]: This is meant to be used for TranslationView only.
 *
 * @param {QuranReaderDataType} quranReaderDataType
 * @param {React.MutableRefObject<VirtuosoHandle>} virtuosoRef
 * @param {number} versesPerPage
 */
const useScrollToVirtualizedTranslationView = (
  quranReaderDataType: QuranReaderDataType,
  virtuosoRef: React.MutableRefObject<VirtuosoHandle>,
  versesPerPage: number,
) => {
  const router = useRouter();
  const { startingVerse } = router.query;

  useEffect(() => {
    // if startingVerse is present in the url
    if (quranReaderDataType === QuranReaderDataType.Chapter && startingVerse) {
      const startingVerseNumber = Number(startingVerse);
      // if the startingVerse is a valid integer and is above 1
      if (Number.isInteger(startingVerseNumber) && startingVerseNumber > 0) {
        const scrollToPageNumber = verseIndexToApiPageNumber(startingVerseNumber, versesPerPage);
        virtuosoRef.current.scrollToIndex({
          index: scrollToPageNumber - 1,
          align: getVersePositionWithinAPage(
            startingVerseNumber,
            versesPerPage,
            scrollToPageNumber,
          ),
        });
      }
    }
  }, [quranReaderDataType, startingVerse, versesPerPage, virtuosoRef]);
};

export default useScrollToVirtualizedTranslationView;
