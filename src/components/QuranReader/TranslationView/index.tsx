/* eslint-disable max-lines */
/* eslint-disable react/no-multi-comp */
import { useEffect, useMemo, useRef, useState } from 'react';

import dynamic from 'next/dynamic';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';

import onCopyQuranWords from '../onCopyQuranWords';
import QueryParamMessage from '../QueryParamMessage';
import getTranslationsLabelString from '../ReadingView/utils/translation';

import useGetVersesCount from './hooks/useGetVersesCount';
import useScrollToVirtualizedVerse from './hooks/useScrollToVirtualizedVerse';
import styles from './TranslationView.module.scss';
import TranslationViewCell from './TranslationViewCell';
import TranslationViewVerse from './TranslationViewVerse';

import ChapterHeader from '@/components/chapters/ChapterHeader'; // SSR fallback needs the header too
import { PageQuestionsContext } from '@/components/QuranReader/ReadingView/context/PageQuestionsContext';
import Spinner from '@/dls/Spinner/Spinner';
import useCountRangeQuestions from '@/hooks/auth/useCountRangeQuestions';
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
  const [hasMounted, setHasMounted] = useState(false);
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

  useEffect(() => {
    setHasMounted(true); // flag client hydration to enable virtualized list afterward
  }, []);

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
  // mushaf is needed to build bookmark ranges during SSR fallback
  const mushafId = useMemo(
    () => getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines).mushaf,
    [quranReaderStyles.mushafLines, quranReaderStyles.quranFont],
  );

  const { data: pageVersesQuestionsData } = useCountRangeQuestions(
    verses?.length > 0
      ? {
          from: verses?.[0].verseKey,
          to: verses?.[verses.length - 1].verseKey,
        }
      : null,
  );

  // Accumulate questions data to prevent flickering when new verses are loaded.
  // When the verse range changes, SWR fetches new data with undefined initial state.
  // By merging new data with existing data, we preserve visibility of the answers button.
  const [accumulatedQuestionsData, setAccumulatedQuestionsData] = useState<
    Record<string, QuestionsData>
  >({});

  // Reset accumulated questions data when the resource context changes
  // to avoid leaking stale data across chapters/pages and unbounded growth.
  useEffect(() => {
    setAccumulatedQuestionsData({});
  }, [resourceId]);

  useEffect(() => {
    if (pageVersesQuestionsData) {
      setAccumulatedQuestionsData((prev) => ({
        ...prev,
        ...pageVersesQuestionsData,
      }));
    }
  }, [pageVersesQuestionsData]);

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

  const queryParamMessage = shouldShowQueryParamMessage ? (
    <QueryParamMessage
      translationsQueryParamDifferent={translationsQueryParamDifferent}
      reciterQueryParamDifferent={reciterQueryParamDifferent}
      wordByWordLocaleQueryParamDifferent={wordByWordLocaleQueryParamDifferent}
    />
  ) : null;

  if (!verses.length) {
    return null;
  }

  // Render SSR fallback before hydration to improve performance and SEO with the full list of verses.
  if (!hasMounted) {
    return (
      <>
        {queryParamMessage}
        <PageQuestionsContext.Provider value={accumulatedQuestionsData}>
          <div
            className={styles.wrapper}
            onCopy={(event) => onCopyQuranWords(event, verses, quranReaderStyles.quranFont)}
          >
            {verses.map((verse, verseIdx) => {
              const bookmarksRangeUrl = isLoggedIn()
                ? makeBookmarksRangeUrl(
                    mushafId,
                    Number(verse.chapterId),
                    Number(verse.verseNumber),
                    initialData.pagination.perPage,
                  )
                : undefined;
              const translationsLabel = getTranslationsLabelString(verse.translations); // reuse translation label for header
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
          </div>
        </PageQuestionsContext.Provider>
      </>
    );
  }

  return (
    <>
      {queryParamMessage}

      <PageQuestionsContext.Provider value={accumulatedQuestionsData}>
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
      </PageQuestionsContext.Provider>
    </>
  );
};

export default TranslationView;
