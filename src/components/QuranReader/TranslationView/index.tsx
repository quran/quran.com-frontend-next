/* eslint-disable max-lines */
/* eslint-disable react/no-multi-comp */
import { useCallback, useMemo, useRef, useState } from 'react';

import classNames from 'classnames';
import dynamic from 'next/dynamic';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';

import onCopyQuranWords from '../onCopyQuranWords';
import QueryParamMessage from '../QueryParamMessage';

import useGetVersesCount from './hooks/useGetVersesCount';
import useScrollToVirtualizedVerse from './hooks/useScrollToVirtualizedVerse';
import styles from './TranslationView.module.scss';
import TranslationViewCell from './TranslationViewCell';
import TranslationViewVerse from './TranslationViewVerse';

import ChapterHeader from '@/components/chapters/ChapterHeader';
import Spinner from '@/dls/Spinner/Spinner';
import useGetQueryParamOrReduxValue from '@/hooks/useGetQueryParamOrReduxValue';
import useGetQueryParamOrXstateValue from '@/hooks/useGetQueryParamOrXstateValue';
import useQcfFont from '@/hooks/useQcfFont';
import QuranReaderStyles from '@/redux/types/QuranReaderStyles';
import { QuranReaderDataType } from '@/types/QuranReader';
import { getMushafId } from '@/utils/api';
import { makeBookmarksRangeUrl } from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';
import { VersesResponse } from 'types/ApiResponses';
import QueryParam from 'types/QueryParam';
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

type StaticVerseListProps = {
  verses: Verse[];
  quranReaderStyles: QuranReaderStyles;
  mushafId: number;
  perPage: number;
};

const StaticVerseList = ({
  verses,
  quranReaderStyles,
  mushafId,
  perPage,
}: StaticVerseListProps) => (
  <>
    {verses.map((verse, verseIdx) => {
      const bookmarksRangeUrl = isLoggedIn()
        ? makeBookmarksRangeUrl(
            mushafId,
            Number(verse.chapterId),
            Number(verse.verseNumber),
            perPage,
          )
        : null;
      return (
        <div key={verse.verseKey} className={styles.container}>
          {verse.verseNumber === 1 && (
            <ChapterHeader chapterId={String(verse.chapterId)} isTranslationView />
          )}
          <TranslationViewCell
            verseIndex={verseIdx}
            verse={verse}
            quranReaderStyles={quranReaderStyles}
            bookmarksRangeUrl={bookmarksRangeUrl}
          />
        </div>
      );
    })}
  </>
);

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
  const mushafId = useMemo(
    () => getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines).mushaf,
    [quranReaderStyles.mushafLines, quranReaderStyles.quranFont],
  );

  // Simplified: just render the item without passing questions data down
  // Each TranslationViewVerse will fetch its own questions data via context
  const itemContentRenderer = useCallback(
    (verseIdx: number) => {
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
    },
    [
      versesCount,
      quranReaderDataType,
      verses,
      initialData,
      quranReaderStyles,
      setApiPageToVersesMap,
      selectedTranslations,
      wordByWordLocale,
      reciterId,
      resourceId,
    ],
  );

  const shouldShowQueryParamMessage =
    translationsQueryParamDifferent ||
    reciterQueryParamDifferent ||
    wordByWordLocaleQueryParamDifferent;

  const isSingleVerse = quranReaderDataType === QuranReaderDataType.Verse;
  const wrapperClassName = classNames(styles.wrapper, {
    [styles.singleVerseWrapper]: isSingleVerse,
  });

  return (
    <>
      {shouldShowQueryParamMessage && (
        <QueryParamMessage
          translationsQueryParamDifferent={translationsQueryParamDifferent}
          reciterQueryParamDifferent={reciterQueryParamDifferent}
          wordByWordLocaleQueryParamDifferent={wordByWordLocaleQueryParamDifferent}
        />
      )}

      <noscript>
        <div className={wrapperClassName}>
          <StaticVerseList
            verses={verses}
            quranReaderStyles={quranReaderStyles}
            mushafId={mushafId}
            perPage={initialData.pagination.perPage}
          />
        </div>
      </noscript>

      <div
        className={wrapperClassName}
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
