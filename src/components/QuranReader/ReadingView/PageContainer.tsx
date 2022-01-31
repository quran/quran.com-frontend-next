import React, { useEffect } from 'react';

import useSWRImmutable from 'swr/immutable';

import { getReaderViewRequestKey, verseFetcher } from '../api';

import Page from './Page';
import ReadingViewSkeleton from './ReadingViewSkeleton';

import QuranReaderStyles from 'src/redux/types/QuranReaderStyles';
import LookupRecord from 'types/LookupRecord';
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

const PageContainer: React.FC<Props> = ({
  pagesVersesRange,
  quranReaderStyles,
  reciterId,
  lang,
  wordByWordLocale,
  pageNumber,
  pageIndex,
  setMushafPageToVersesMap,
}) => {
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
  );

  useEffect(() => {
    if (verses) {
      // @ts-ignore
      setMushafPageToVersesMap((prevMushafPageToVersesMap) => ({
        ...prevMushafPageToVersesMap,
        [pageNumber]: verses,
      }));
    }
  }, [verses, pageNumber, setMushafPageToVersesMap]);

  if (!verses || isValidating) {
    return <ReadingViewSkeleton />;
  }

  return (
    <Page
      verses={verses}
      key={`page-${pageNumber}`}
      page={Number(pageNumber)}
      quranReaderStyles={quranReaderStyles}
      pageIndex={pageIndex}
    />
  );
};

export default PageContainer;
