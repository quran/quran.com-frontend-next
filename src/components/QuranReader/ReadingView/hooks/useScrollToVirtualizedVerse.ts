import { useEffect, useRef } from 'react';

import { useRouter } from 'next/router';
import { VirtuosoHandle } from 'react-virtuoso';

import QuranReaderStyles from '@/redux/types/QuranReaderStyles';
import { getMushafId } from '@/utils/api';
import { makeVersesFilterUrl } from '@/utils/apiPaths';
import { getVerseNumberFromKey } from '@/utils/verse';
import { fetcher } from 'src/api';
import { VersesResponse } from 'types/ApiResponses';
import LookupRecord from 'types/LookupRecord';
import { MushafLines, QuranFont, QuranReaderDataType } from 'types/QuranReader';
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

  /**
   * We need to scroll again when we have just changed the font since the same
   * verse might lie on another page/position. Same for when we change the
   * verse.
   */
  useEffect(() => {
    shouldScroll.current = true;
  }, [quranFont, mushafLines, startingVerse]);

  useEffect(
    // eslint-disable-next-line react-func/max-lines-per-function
    () => {
      // if we have the data of the page lookup
      if (!isPagesLookupLoading && virtuosoRef.current && Object.keys(pagesVersesRange).length) {
        // if startingVerse is present in the url
        if (quranReaderDataType === QuranReaderDataType.Chapter && startingVerse) {
          const startingVerseNumber = Number(startingVerse);
          // if the startingVerse is a valid integer and is above 1
          if (Number.isInteger(startingVerseNumber) && startingVerseNumber > 0) {
            const firstPageOfCurrentChapter = isUsingDefaultFont
              ? initialData.verses[0].pageNumber
              : Number(Object.keys(pagesVersesRange)[0]);
            // search for the verse number in the already fetched verses first
            const startFromVerseData = verses.find(
              (verse) => verse.verseNumber === startingVerseNumber,
            );
            if (
              startFromVerseData &&
              shouldScroll.current === true &&
              pagesVersesRange[startFromVerseData.pageNumber]
            ) {
              const scrollToPageIndex = startFromVerseData.pageNumber - firstPageOfCurrentChapter;
              virtuosoRef.current.scrollToIndex({
                index: scrollToPageIndex,
                align: getVersePositionWithinAMushafPage(
                  `${chapterId}:${startingVerseNumber}`,
                  startFromVerseData.pageNumber,
                  pagesVersesRange,
                ),
              });
              shouldScroll.current = false;
            } else {
              // get the page number by the verse key and the mushafId (because the page will be different for Indopak Mushafs)
              fetcher(
                makeVersesFilterUrl({
                  filters: `${chapterId}:${startingVerseNumber}`,
                  fields: `page_number`,
                  ...getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines),
                }),
              ).then((response: VersesResponse) => {
                if (response.verses.length && shouldScroll.current === true) {
                  const scrollToPageIndex =
                    response.verses[0].pageNumber - firstPageOfCurrentChapter;
                  if (pagesVersesRange[response.verses[0].pageNumber]) {
                    virtuosoRef.current.scrollToIndex({
                      index: scrollToPageIndex,
                      align: getVersePositionWithinAMushafPage(
                        `${chapterId}:${startingVerseNumber}`,
                        response.verses[0].pageNumber,
                        pagesVersesRange,
                      ),
                    });
                    shouldScroll.current = false;
                  }
                }
              });
            }
          }
        }
      }
    },
    [
      chapterId,
      initialData.verses,
      isPagesLookupLoading,
      isUsingDefaultFont,
      pagesVersesRange,
      quranReaderDataType,
      quranReaderStyles.mushafLines,
      quranReaderStyles.quranFont,
      startingVerse,
      verses,
      virtuosoRef,
    ],
  );
};

export default useScrollToVirtualizedReadingView;
