/* eslint-disable max-lines */
/* eslint-disable react/no-multi-comp */
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import dynamic from 'next/dynamic';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';

import onCopyQuranWords from '../onCopyQuranWords';
import QueryParamMessage from '../QueryParamMessage';

import useGetVersesCount from './hooks/useGetVersesCount';
import useScrollToVirtualizedVerse from './hooks/useScrollToVirtualizedVerse';
import PageQuestionsLoaders from './PageQuestionsLoader';
import styles from './TranslationView.module.scss';
import TranslationViewCell from './TranslationViewCell';
import TranslationViewVerse from './TranslationViewVerse';

import ChapterHeader from '@/components/chapters/ChapterHeader';
import { PageQuestionsContext } from '@/components/QuranReader/ReadingView/context/PageQuestionsContext';
import getTranslationsLabelString from '@/components/QuranReader/ReadingView/utils/translation';
import Spinner from '@/dls/Spinner/Spinner';
import useGetQueryParamOrReduxValue from '@/hooks/useGetQueryParamOrReduxValue';
import useGetQueryParamOrXstateValue from '@/hooks/useGetQueryParamOrXstateValue';
import useQcfFont from '@/hooks/useQcfFont';
import QuranReaderStyles from '@/redux/types/QuranReaderStyles';
import { QuranReaderDataType } from '@/types/QuranReader';
import { getMushafId } from '@/utils/api';
import { QuestionsData } from '@/utils/auth/api';
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

type PageVersesQuestionsData = Record<string, QuestionsData>;

const EndOfScrollingControls = dynamic(() => import('../EndOfScrollingControls'), {
  ssr: false,
  loading: () => <Spinner />,
});

const INCREASE_VIEWPORT_BY_PIXELS = 1000;

type TranslationViewWrapperProps = {
  verses: Verse[];
  quranReaderStyles: QuranReaderStyles;
  pageVersesQuestionsData: PageVersesQuestionsData;
  children: ReactNode;
};

const TranslationViewWrapper = ({
  verses,
  quranReaderStyles,
  pageVersesQuestionsData,
  children,
}: TranslationViewWrapperProps) => (
  <PageQuestionsContext.Provider value={pageVersesQuestionsData}>
    <div
      className={styles.wrapper}
      onCopy={(event) => onCopyQuranWords(event, verses, quranReaderStyles.quranFont)}
    >
      {children}
    </div>
  </PageQuestionsContext.Provider>
);

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
        : undefined;
      const translationsLabel = getTranslationsLabelString(verse.translations);
      return (
        <div key={verse.verseKey} className={styles.container}>
          {verse.verseNumber === 1 && (
            <ChapterHeader
              translationsLabel={translationsLabel}
              translationsCount={verse.translations?.length}
              chapterId={String(verse.chapterId)}
              pageNumber={verse.pageNumber}
              hizbNumber={verse.hizbNumber}
              isTranslationView
            />
          )}
          <TranslationViewCell
            verseIndex={verseIdx}
            verse={verse}
            quranReaderStyles={quranReaderStyles}
            bookmarksRangeUrl={bookmarksRangeUrl}
            hasNotes={false}
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

  // Store questions data per page to avoid large API requests.
  // Each page fetches its own questions data for a smaller verse range.
  const [pageQuestionsMap, setPageQuestionsMap] = useState<
    Record<number, Record<string, QuestionsData>>
  >({});

  // Reset questions data when the resource context changes (e.g., navigating between chapters)
  // to avoid leaking stale data across chapters/pages and unbounded growth.
  useEffect(() => {
    setPageQuestionsMap({});
  }, [resourceId]);

  // Callback for PageQuestionsLoaders to report each page's questions data.
  const handleQuestionsLoaded = useCallback(
    (pageNumber: number, data: Record<string, QuestionsData>) => {
      setPageQuestionsMap((prev) => {
        const prevPageData = prev[pageNumber];
        // Avoid unnecessary state updates if data content is the same.
        // Deep compare since SWR may return new object references for identical data.
        if (prevPageData && JSON.stringify(prevPageData) === JSON.stringify(data)) {
          return prev;
        }
        return {
          ...prev,
          [pageNumber]: data,
        };
      });
    },
    [],
  );

  // Compute accumulated questions data from all loaded pages.
  // This merges questions data from each page into a single object.
  const accumulatedQuestionsData = useMemo(() => {
    const result: Record<string, QuestionsData> = {};
    Object.values(pageQuestionsMap).forEach((pageData) => {
      Object.assign(result, pageData);
    });
    return result;
  }, [pageQuestionsMap]);

  // Wrap in useCallback with accumulatedQuestionsData as dependency.
  // This ensures Virtuoso re-renders items when questions data changes,
  // fixing the issue where Answers buttons wouldn't appear after async data loads.
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
          questionsData={accumulatedQuestionsData}
        />
      );
    },
    [
      versesCount,
      quranReaderDataType,
      verses,
      initialData,
      accumulatedQuestionsData,
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
        <TranslationViewWrapper
          verses={verses}
          quranReaderStyles={quranReaderStyles}
          pageVersesQuestionsData={accumulatedQuestionsData}
        >
          <StaticVerseList
            verses={verses}
            quranReaderStyles={quranReaderStyles}
            mushafId={mushafId}
            perPage={initialData.pagination.perPage}
          />
        </TranslationViewWrapper>
      </noscript>

      {/* Fetches questions for each loaded page without rendering any UI */}
      <PageQuestionsLoaders
        apiPageToVersesMap={apiPageToVersesMap}
        onQuestionsLoaded={handleQuestionsLoaded}
      />

      <TranslationViewWrapper
        verses={verses}
        quranReaderStyles={quranReaderStyles}
        pageVersesQuestionsData={accumulatedQuestionsData}
      >
        <Virtuoso
          ref={virtuosoRef}
          useWindowScroll
          totalCount={versesCount + 1}
          increaseViewportBy={INCREASE_VIEWPORT_BY_PIXELS}
          initialItemCount={1} // needed for SSR.
          itemContent={itemContentRenderer}
        />
      </TranslationViewWrapper>
    </>
  );
};

export default TranslationView;
