import { useEffect } from 'react';

import { useRouter } from 'next/router';
import { VirtuosoHandle } from 'react-virtuoso';

import { fetcher } from 'src/api';
import QuranReaderStyles from 'src/redux/types/QuranReaderStyles';
import { getMushafId } from 'src/utils/api';
import { makeVersesFilterUrl } from 'src/utils/apiPaths';
import { VersesResponse } from 'types/ApiResponses';
import { QuranReaderDataType } from 'types/QuranReader';
import Verse from 'types/Verse';

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
 */
const useScrollToVirtualizedReadingView = (
  quranReaderDataType: QuranReaderDataType,
  virtuosoRef: React.MutableRefObject<VirtuosoHandle>,
  initialData: VersesResponse,
  quranReaderStyles: QuranReaderStyles,
  verses: Verse[],
) => {
  const router = useRouter();
  const { startingVerse, chapterId } = router.query;

  useEffect(() => {
    // if startingVerse is present in the url
    if (quranReaderDataType === QuranReaderDataType.Chapter && startingVerse) {
      const startingVerseNumber = Number(startingVerse);
      // if the startingVerse is a valid integer and is above 1
      if (Number.isInteger(startingVerseNumber) && startingVerseNumber > 0) {
        const firstPageOfCurrentChapter = initialData.verses[0].pageNumber;
        // search for the verse number in the already fetched verses first
        const startFromVerse = verses.find((verse) => verse.verseNumber === startingVerseNumber);
        if (startFromVerse) {
          virtuosoRef.current.scrollToIndex(startFromVerse.pageNumber - firstPageOfCurrentChapter);
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
              virtuosoRef.current.scrollToIndex(
                response.verses[0].pageNumber - firstPageOfCurrentChapter,
              );
            }
          });
        }
      }
    }
    // we want to exclude verses as a dependency so that when the user scroll past the starting verse, this hook won't run again and force scroll to the initial startingVerse.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    chapterId,
    initialData.verses,
    quranReaderDataType,
    quranReaderStyles.mushafLines,
    quranReaderStyles.quranFont,
    startingVerse,
    virtuosoRef,
  ]);
};

export default useScrollToVirtualizedReadingView;
