import { useEffect } from 'react';

import { useRouter } from 'next/router';
import { VirtuosoHandle } from 'react-virtuoso';

import { fetcher } from 'src/api';
import QuranReaderStyles from 'src/redux/types/QuranReaderStyles';
import { getMushafId } from 'src/utils/api';
import { makeVersesFilterUrl } from 'src/utils/apiPaths';
import { getVerseNumberFromKey } from 'src/utils/verse';
import { VersesResponse } from 'types/ApiResponses';
import LookupRecord from 'types/LookupRecord';
import { QuranReaderDataType } from 'types/QuranReader';
import Verse from 'types/Verse';

enum ScrollAlign {
  Start = 'start',
  Center = 'center',
  End = 'end',
}

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
 */
const useScrollToVirtualizedReadingView = (
  quranReaderDataType: QuranReaderDataType,
  virtuosoRef: React.MutableRefObject<VirtuosoHandle>,
  initialData: VersesResponse,
  quranReaderStyles: QuranReaderStyles,
  verses: Verse[],
  pagesVersesRange: Record<number, LookupRecord>,
) => {
  const router = useRouter();
  const { startingVerse, chapterId } = router.query;

  useEffect(
    // eslint-disable-next-line react-func/max-lines-per-function
    () => {
      // if we have the data of the page lookup
      if (Object.keys(pagesVersesRange).length) {
        // if startingVerse is present in the url
        if (quranReaderDataType === QuranReaderDataType.Chapter && startingVerse) {
          const startingVerseNumber = Number(startingVerse);
          // if the startingVerse is a valid integer and is above 1
          if (Number.isInteger(startingVerseNumber) && startingVerseNumber > 0) {
            const firstPageOfCurrentChapter = initialData.verses[0].pageNumber;
            // search for the verse number in the already fetched verses first
            const startFromVerse = verses.find(
              (verse) => verse.verseNumber === startingVerseNumber,
            );
            if (startFromVerse) {
              const scrollToPageIndex = startFromVerse.pageNumber - firstPageOfCurrentChapter;
              virtuosoRef.current.scrollToIndex({
                index: scrollToPageIndex,
                align: getVersePositionWithinAMushafPage(
                  `${chapterId}:${startingVerseNumber}`,
                  startFromVerse.pageNumber,
                  pagesVersesRange,
                ),
              });
            } else {
              // get the page number by the verse key and the mushafId (because the page will be different for Indopak Mushafs)
              fetcher(
                makeVersesFilterUrl({
                  filters: `${chapterId}:${startingVerseNumber}`,
                  fields: `page_number`,
                  ...getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines),
                }),
              ).then((response: VersesResponse) => {
                if (response.verses.length) {
                  const scrollToPageIndex =
                    response.verses[0].pageNumber - firstPageOfCurrentChapter;
                  virtuosoRef.current.scrollToIndex({
                    index: scrollToPageIndex,
                    align: getVersePositionWithinAMushafPage(
                      `${chapterId}:${startingVerseNumber}`,
                      response.verses[0].pageNumber,
                      pagesVersesRange,
                    ),
                  });
                }
              });
            }
          }
        }
      }
    },
    // we want to exclude verses as a dependency so that when the user scroll past the starting verse, this hook won't run again and force scroll to the initial startingVerse.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      chapterId,
      initialData.verses,
      pagesVersesRange,
      quranReaderDataType,
      quranReaderStyles.mushafLines,
      quranReaderStyles.quranFont,
      startingVerse,
      virtuosoRef,
    ],
  );
};

export default useScrollToVirtualizedReadingView;
