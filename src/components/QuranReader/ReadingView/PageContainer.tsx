import React, { useEffect, useMemo } from 'react';

import { useSelector } from 'react-redux';
import useSWRImmutable from 'swr/immutable';

import Page from './Page';
import ReadingViewSkeleton from './ReadingViewSkeleton';

import { getReaderViewRequestKey, verseFetcher } from 'src/components/QuranReader/api';
import { getPageNumberByPageIndex } from 'src/components/QuranReader/utils/page';
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
  const pageNumber = useMemo(
    () => getPageNumberByPageIndex(pageIndex, pagesVersesRange),
    [pageIndex, pagesVersesRange],
  );
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

  useEffect(() => {
    if (verses) {
      // @ts-ignore
      setMushafPageToVersesMap((prevMushafPageToVersesMap: Record<number, Verse[]>) => ({
        ...prevMushafPageToVersesMap,
        [pageNumber]: verses,
      }));
    }
  }, [pageNumber, setMushafPageToVersesMap, verses]);

  if (!verses || isValidating) {
    return <ReadingViewSkeleton />;
  }

  return (
    <Page
      verses={verses}
      key={`page-${pageNumber}`}
      pageNumber={Number(pageNumber)}
      quranReaderStyles={quranReaderStyles}
      pageIndex={pageIndex}
    />
  );
};

export default PageContainer;
