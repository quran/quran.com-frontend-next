/* eslint-disable max-lines */
/* eslint-disable react/no-multi-comp */
import { useMemo, useRef, useState } from 'react';

import dynamic from 'next/dynamic';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';

import onCopyQuranWords from '../onCopyQuranWords';
import QueryParamMessage from '../QueryParamMessage';

import useGetVersesCount from './hooks/useGetVersesCount';
import useScrollToVirtualizedVerse from './hooks/useScrollToVirtualizedVerse';
import styles from './TranslationView.module.scss';
import TranslationViewVerse from './TranslationViewVerse';

import Spinner from '@/dls/Spinner/Spinner';
import useGetQueryParamOrReduxValue from '@/hooks/useGetQueryParamOrReduxValue';
import useGetQueryParamOrXstateValue from '@/hooks/useGetQueryParamOrXstateValue';
import useQcfFont from '@/hooks/useQcfFont';
import QuranReaderStyles from '@/redux/types/QuranReaderStyles';
import { VersesResponse } from 'types/ApiResponses';
import QueryParam from 'types/QueryParam';
import { QuranReaderDataType } from 'types/QuranReader';
import Verse from 'types/Verse';

type TranslationViewProps = {
  quranReaderStyles: QuranReaderStyles;
  quranReaderDataType: QuranReaderDataType;
  initialData: VersesResponse;
  resourceId: number | string; // can be the chapter, verse, tafsir, hizb, juz, rub or page's ID.
};

const EndOfScrollingControls = dynamic(() => import('../EndOfScrollingControls'), {
  ssr: false,
  loading: () => <Spinner />,
});

const INCREASE_VIEWPORT_BY_PIXELS = 1000;

const TranslationView = ({
  quranReaderStyles,
  quranReaderDataType,
  initialData,
  resourceId,
}: TranslationViewProps) => {
  const [apiPageToVersesMap, setApiPageToVersesMap] = useState<Record<number, Verse[]>>({
    1: initialData.verses,
  });
  const {
    value: reciterId,
    isQueryParamDifferent: reciterQueryParamDifferent,
  }: { value: number; isQueryParamDifferent: boolean } = useGetQueryParamOrXstateValue(
    QueryParam.RECITER,
  );
  const {
    value: selectedTranslations,
    isQueryParamDifferent: translationsQueryParamDifferent,
  }: { value: number[]; isQueryParamDifferent: boolean } = useGetQueryParamOrReduxValue(
    QueryParam.TRANSLATIONS,
  );
  const {
    value: wordByWordLocale,
    isQueryParamDifferent: wordByWordLocaleQueryParamDifferent,
  }: { value: string; isQueryParamDifferent: boolean } = useGetQueryParamOrReduxValue(
    QueryParam.WBW_LOCALE,
  );

  const versesCount = useGetVersesCount({
    resourceId,
    quranReaderDataType,
    initialData,
    quranReaderStyles,
  });

  const virtuosoRef = useRef<VirtuosoHandle>(null);
  useScrollToVirtualizedVerse(
    quranReaderDataType,
    virtuosoRef,
    apiPageToVersesMap,
    String(resourceId),
    initialData.pagination.perPage,
  );
  const verses = useMemo(() => Object.values(apiPageToVersesMap).flat(), [apiPageToVersesMap]);
  useQcfFont(quranReaderStyles.quranFont, verses);

  const itemContentRenderer = (verseIdx: number) => {
    if (verseIdx === versesCount) {
      return (
        <EndOfScrollingControls
          quranReaderDataType={quranReaderDataType}
          lastVerse={verses[verses.length - 1]}
          initialData={initialData}
        />
      );
    }

    return (
      <TranslationViewVerse
        verseIdx={verseIdx}
        totalVerses={versesCount}
        quranReaderDataType={quranReaderDataType}
        quranReaderStyles={quranReaderStyles}
        setApiPageToVersesMap={setApiPageToVersesMap}
        selectedTranslations={selectedTranslations}
        wordByWordLocale={wordByWordLocale}
        reciterId={reciterId}
        initialData={initialData}
        resourceId={resourceId}
      />
    );
  };

  const shouldShowQueryParamMessage =
    translationsQueryParamDifferent ||
    reciterQueryParamDifferent ||
    wordByWordLocaleQueryParamDifferent;

  return (
    <>
      {shouldShowQueryParamMessage && (
        <QueryParamMessage
          translationsQueryParamDifferent={translationsQueryParamDifferent}
          reciterQueryParamDifferent={reciterQueryParamDifferent}
          wordByWordLocaleQueryParamDifferent={wordByWordLocaleQueryParamDifferent}
        />
      )}

      <div
        className={styles.wrapper}
        onCopy={(event) => onCopyQuranWords(event, verses, quranReaderStyles.quranFont)}
      >
        <Virtuoso
          ref={virtuosoRef}
          useWindowScroll
          totalCount={versesCount + 1}
          increaseViewportBy={INCREASE_VIEWPORT_BY_PIXELS}
          initialItemCount={1} // needed for SSR.
          itemContent={itemContentRenderer}
        />
      </div>
    </>
  );
};

export default TranslationView;
