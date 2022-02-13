import React, { useEffect, useMemo } from 'react';

import { useSelector } from 'react-redux';
import useSWRImmutable from 'swr/immutable';

import { getReaderViewRequestKey, verseFetcher } from '../api';

import Page from './Page';
import ReadingViewSkeleton from './ReadingViewSkeleton';

import { getQuranReaderStylesInitialState } from 'src/redux/defaultSettings/util';
import { selectIsUsingDefaultReciter } from 'src/redux/slices/AudioPlayer/state';
import { selectIsUsingDefaultWordByWordLocale } from 'src/redux/slices/QuranReader/readingPreferences';
import QuranReaderStyles from 'src/redux/types/QuranReaderStyles';
import { VersesResponse } from 'types/ApiResponses';
import LookupRecord from 'types/LookupRecord';
import { QuranFont, QuranReaderDataType } from 'types/QuranReader';
import Verse from 'types/Verse';

type Props = {
  pagesVersesRange: Record<number, LookupRecord>;
  quranReaderStyles: QuranReaderStyles;
  reciterId: number;
  pageNumber: number;
  lang: string;
  wordByWordLocale: string;
  pageIndex: number;
  setMushafPageToVersesMap: (data: Record<number, Verse[]>) => void;
  initialData: VersesResponse;
  quranReaderDataType: QuranReaderDataType;
};

const getPageVersesRange = (
  currentMushafPage: number,
  apiPagesVersesRange: Record<number, LookupRecord>,
): LookupRecord => {
  const lookupRecord = { ...apiPagesVersesRange[currentMushafPage] };
  // we remove firstVerseKey and lastVerseKey before we send the params to BE as BE doesn't need them
  delete lookupRecord.firstVerseKey;
  delete lookupRecord.lastVerseKey;
  return lookupRecord;
};

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
  pageNumber,
  pageIndex,
  setMushafPageToVersesMap,
  initialData,
  quranReaderDataType,
}: Props): JSX.Element => {
  const isUsingDefaultReciter = useSelector(selectIsUsingDefaultReciter);
  const isUsingDefaultWordByWordLocale = useSelector(selectIsUsingDefaultWordByWordLocale);
  const shouldUseInitialData =
    pageIndex === 0 &&
    quranReaderStyles.quranFont === getQuranReaderStylesInitialState(lang).quranFont &&
    isUsingDefaultReciter &&
    isUsingDefaultWordByWordLocale &&
    quranReaderStyles.quranFont !== QuranFont.Tajweed &&
    quranReaderDataType !== QuranReaderDataType.Juz;
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
    <Page
      verses={pageVerses}
      key={`page-${pageNumber}`}
      pageNumber={Number(pageNumber)}
      quranReaderStyles={quranReaderStyles}
      pageIndex={pageIndex}
    />
  );
};

export default PageContainer;
