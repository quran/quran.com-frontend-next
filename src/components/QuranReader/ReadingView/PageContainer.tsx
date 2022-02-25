import React, { useEffect, useMemo } from 'react';

import { useSelector } from 'react-redux';
import useSWRImmutable from 'swr/immutable';

import { getReaderViewRequestKey, verseFetcher } from '../api';

import Page from './Page';
import ReadingViewSkeleton from './ReadingViewSkeleton';

import { selectIsUsingDefaultReciter } from 'src/redux/slices/AudioPlayer/state';
import { selectIsUsingDefaultWordByWordLocale } from 'src/redux/slices/QuranReader/readingPreferences';
import QuranReaderStyles from 'src/redux/types/QuranReaderStyles';
import { VersesResponse } from 'types/ApiResponses';
import LookupRecord from 'types/LookupRecord';
import Verse from 'types/Verse';

type Props = {
  pagesVersesRange: Record<number, LookupRecord>;
  quranReaderStyles: QuranReaderStyles;
  reciterId: number;
  lang: string;
  wordByWordLocale: string;
  pageIndex: number;
  setMushafPageToVersesMap: (data: Record<number, Verse[]>) => void;
  initialData: VersesResponse;
  isUsingDefaultFont: boolean;
};

const getPageVersesRange = (
  currentMushafPage: number,
  apiPagesVersesRange: Record<number, LookupRecord>,
): LookupRecord => {
  const lookupRecord = { ...apiPagesVersesRange[currentMushafPage] };
  // TODO: remove this from BE
  // we remove firstVerseKey and lastVerseKey before we send the params to BE as BE doesn't need them
  delete lookupRecord.firstVerseKey;
  delete lookupRecord.lastVerseKey;
  return lookupRecord;
};

/**
 * Get the current page number this is calculated by added the pageIndex
 * to the page number of the first page of the current resource e.g. chapterId.
 * (when we are not using the default font, the first page number of the resource
 * will change based on the mushaf so we will resort to using pagesVersesRange of
 * the selected Mushaf instead of the initialData instead.
 * )
 *
 * @param {VersesResponse} initialData
 * @param {number} pageIndex
 * @param {boolean} isUsingDefaultFont
 * @param {Record<number, LookupRecord>} pagesVersesRange
 * @returns {number}
 */
const getPageNumber = (
  initialData: VersesResponse,
  pageIndex: number,
  isUsingDefaultFont: boolean,
  pagesVersesRange: Record<number, LookupRecord>,
): number =>
  isUsingDefaultFont
    ? initialData.verses[0].pageNumber + pageIndex
    : Number(Object.keys(pagesVersesRange)[0]) + pageIndex;

/**
 * A component that will fetch the verses of the current mushaf page
 * and will render a skeleton while it's loading.
 *
 * @param {Props} param0
 * @returns {JSX.Element}
 */
const PageContainer: React.FC<Props> = ({
  pagesVersesRange,
  quranReaderStyles,
  reciterId,
  lang,
  wordByWordLocale,
  pageIndex,
  setMushafPageToVersesMap,
  initialData,
  isUsingDefaultFont,
}: Props): JSX.Element => {
  const pageNumber = getPageNumber(initialData, pageIndex, isUsingDefaultFont, pagesVersesRange);
  const isUsingDefaultReciter = useSelector(selectIsUsingDefaultReciter);
  const isUsingDefaultWordByWordLocale = useSelector(selectIsUsingDefaultWordByWordLocale);
  const shouldUseInitialData =
    pageIndex === 0 &&
    isUsingDefaultFont &&
    isUsingDefaultReciter &&
    isUsingDefaultWordByWordLocale;
  const { data: verses, isValidating } = useSWRImmutable(
    getReaderViewRequestKey({
      pageNumber,
      pageVersesRange: getPageVersesRange(pageNumber, pagesVersesRange),
      quranReaderStyles,
      reciter: reciterId,
      locale: lang,
      wordByWordLocale,
    }),
    verseFetcher,
    {
      fallbackData: shouldUseInitialData ? initialData.verses : null,
      revalidateOnMount: !shouldUseInitialData,
    },
  );

  const pageVerses = useMemo(() => {
    // we need to filter only the verses that belong to the current page because sometimes the initial data number of verses exceeds the number of verses of the page e.g. /2 page 2
    if (shouldUseInitialData) {
      return verses.filter((verse) => pageNumber === verse.pageNumber);
    }
    return verses;
  }, [pageNumber, shouldUseInitialData, verses]);

  useEffect(() => {
    if (pageVerses) {
      // @ts-ignore
      setMushafPageToVersesMap((prevMushafPageToVersesMap: Record<number, Verse[]>) => ({
        ...prevMushafPageToVersesMap,
        [pageNumber]: pageVerses,
      }));
    }
  }, [pageNumber, setMushafPageToVersesMap, pageVerses]);

  if (!pageVerses || isValidating) {
    return <ReadingViewSkeleton />;
  }

  return (
    <div>
      <Page
        verses={pageVerses}
        key={`page-${pageNumber}`}
        pageNumber={Number(pageNumber)}
        quranReaderStyles={quranReaderStyles}
        pageIndex={pageIndex}
      />
      <ReadingViewSkeleton />
    </div>
  );
};

export default PageContainer;
