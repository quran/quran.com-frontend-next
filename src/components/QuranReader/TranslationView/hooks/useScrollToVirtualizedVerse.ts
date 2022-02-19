import { useEffect } from 'react';

import { useRouter } from 'next/router';
import { VirtuosoHandle } from 'react-virtuoso';

import { QuranReaderDataType } from 'types/QuranReader';

/**
 * Convert a verse index to a page number by dividing the index
 * by how many items there are in a page.
 *
 * @param {number} verseNumber
 * @param {number} versesPerPage
 * @returns {number}
 */
const verseIndexToApiPageNumber = (verseNumber: number, versesPerPage: number): number =>
  Math.floor(verseNumber / versesPerPage) + 1;

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
        const scrollToPageIndex = verseIndexToApiPageNumber(startingVerseNumber, versesPerPage) - 1;
        virtuosoRef.current.scrollToIndex({
          index: scrollToPageIndex,
          align: 'start',
        });
      }
    }
  }, [quranReaderDataType, startingVerse, versesPerPage, virtuosoRef]);
};

export default useScrollToVirtualizedTranslationView;
