/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable react/no-multi-comp */
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { useSelector as useXstateSelector } from '@xstate/react';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useHotkeys } from 'react-hotkeys-hook';
import { shallowEqual, useSelector } from 'react-redux';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';

import usePageNavigation from './hooks/usePageNavigation';
import useScrollToVirtualizedVerse from './hooks/useScrollToVirtualizedVerse';
import PageContainer from './PageContainer';
import PageNavigationButtons from './PageNavigationButtons';
import styles from './ReadingView.module.scss';
import ReadingViewSkeleton from './ReadingViewSkeleton';

import ReadingModeActions from '@/components/chapters/ChapterHeader/ReadingModeActions';
import EmptyTranslationMessage from '@/components/QuranReader/ContextMenu/components/EmptyTranslationMessage';
import useFetchPagesLookup from '@/components/QuranReader/hooks/useFetchPagesLookup';
import onCopyQuranWords from '@/components/QuranReader/onCopyQuranWords';
import QueryParamMessage from '@/components/QuranReader/QueryParamMessage';
import DataContext from '@/contexts/DataContext';
import StartingVerseHighlightContext from '@/contexts/StartingVerseHighlightContext';
import Spinner from '@/dls/Spinner/Spinner';
import useGetQueryParamOrReduxValue from '@/hooks/useGetQueryParamOrReduxValue';
import useGetQueryParamOrXstateValue from '@/hooks/useGetQueryParamOrXstateValue';
import useQcfFont from '@/hooks/useQcfFont';
import Error from '@/pages/_error';
import { selectedLastReadPage } from '@/redux/slices/QuranReader/readingTracker';
import { selectIsUsingDefaultFont } from '@/redux/slices/QuranReader/styles';
import { selectSelectedTranslations } from '@/redux/slices/QuranReader/translations';
import QuranReaderStyles from '@/redux/types/QuranReaderStyles';
import { QuranReaderDataType, ReadingPreference } from '@/types/QuranReader';
import { logButtonClick } from '@/utils/eventLogger';
import { getLineWidthClassName } from '@/utils/fontFaceHelper';
import { isValidVerseId, isValidVerseKey } from '@/utils/validator';
import { getVerseAndChapterNumbersFromKey, makeVerseKey } from '@/utils/verse';
import { selectIsAudioPlaying } from 'src/xstate/actors/audioPlayer/selectors';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';
import { VersesResponse } from 'types/ApiResponses';
import QueryParam from 'types/QueryParam';
import Verse from 'types/Verse';

const EndOfScrollingControls = dynamic(
  () => import('@/components/QuranReader/EndOfScrollingControls'),
  {
    ssr: false,
    loading: () => <Spinner />,
  },
);

type ReadingViewProps = {
  quranReaderStyles: QuranReaderStyles;
  quranReaderDataType: QuranReaderDataType;
  initialData: VersesResponse;
  resourceId: number | string; // can be the chapter, verse, tafsir, hizb, juz, rub or page's ID.
  readingPreference: ReadingPreference;
};

const INCREASE_VIEWPORT_BY_PIXELS = 1200;
const STARTING_VERSE_HIGHLIGHT_DURATION_MS = 5000;

const getInitialMushafMap = (initialData: VersesResponse): Record<number, Verse[]> => {
  const firstVerse = initialData?.verses?.[0];

  if (!firstVerse || !Number.isInteger(firstVerse.pageNumber) || firstVerse.pageNumber <= 0) {
    return {};
  }

  return { [firstVerse.pageNumber]: initialData.verses };
};

const ReadingView = ({
  quranReaderStyles,
  quranReaderDataType,
  initialData,
  resourceId,
  readingPreference,
}: ReadingViewProps) => {
  const router = useRouter();
  const chaptersData = useContext(DataContext);
  const audioService = useContext(AudioPlayerMachineContext);
  const [mushafPageToVersesMap, setMushafPageToVersesMap] = useState<Record<number, Verse[]>>(() =>
    getInitialMushafMap(initialData),
  );
  const [startingVerseHighlightVerseKey, setStartingVerseHighlightVerseKey] = useState<
    string | undefined
  >(undefined);
  const isVerseAudioPlaying = useXstateSelector(
    audioService,
    (state) => selectIsAudioPlaying(state) && !state.context.radioActor,
  );

  const { lang } = useTranslation('quran-reader');
  const isUsingDefaultFont = useSelector(selectIsUsingDefaultFont);
  const lastReadPageNumber = useSelector(selectedLastReadPage, shallowEqual);
  const selectedTranslations = useSelector(selectSelectedTranslations);

  // Check if we should show empty state (in ReadingTranslation mode with no translations)
  const isTranslationMode = readingPreference === ReadingPreference.ReadingTranslation;
  const hasTranslations = selectedTranslations && selectedTranslations.length > 0;
  const showEmptyState = isTranslationMode && !hasTranslations;

  // Determine if ReaderTopActions would show mode actions (to avoid duplicate rendering)
  // ReaderTopActions shows for: non-Chapter, non-Tafsir types that don't start at verse 1
  const firstVerse = initialData?.verses?.[0];
  const readerTopActionsWouldShow =
    firstVerse &&
    quranReaderDataType !== QuranReaderDataType.Chapter &&
    firstVerse.verseNumber !== 1;

  // Use chapterId from the loaded verses data instead of the route param.
  // Route param can be a slug on chapter pages (e.g. /al-baqarah).
  const chapterId = firstVerse?.chapterId ? String(firstVerse.chapterId) : undefined;

  // Get the startingVerse from the query params. Used to highlight the verse in mushaf mode.
  const startingVerseQueryParam = router.query[QueryParam.STARTING_VERSE];
  const startingVerse = Array.isArray(startingVerseQueryParam)
    ? startingVerseQueryParam[0]
    : startingVerseQueryParam;

  const verses = useMemo(
    () => Object.values(mushafPageToVersesMap).flat(),
    [mushafPageToVersesMap],
  );
  const {
    value: reciterId,
    isQueryParamDifferent: reciterQueryParamDifferent,
  }: { value: number; isQueryParamDifferent: boolean } = useGetQueryParamOrXstateValue(
    QueryParam.RECITER,
  );
  const {
    value: wordByWordLocale,
    isQueryParamDifferent: wordByWordLocaleQueryParamDifferent,
  }: { value: string; isQueryParamDifferent: boolean } = useGetQueryParamOrReduxValue(
    QueryParam.WBW_LOCALE,
  );

  useEffect(() => {
    if (readingPreference !== ReadingPreference.Reading || isVerseAudioPlaying || !startingVerse) {
      setStartingVerseHighlightVerseKey(undefined);
      return undefined;
    }

    const startingVerseValue = String(startingVerse);
    const isStartingVerseKeyFormat = startingVerseValue.includes(':'); // Detect "SS:VV" format used on multi-surah pages.
    let resolvedStartingVerseKey: string | undefined;

    if (isStartingVerseKeyFormat) {
      if (isValidVerseKey(chaptersData, startingVerseValue)) {
        const [targetChapterId, targetVerseNumber] =
          getVerseAndChapterNumbersFromKey(startingVerseValue);
        const normalizedChapterId = Number(targetChapterId);
        const normalizedVerseNumber = Number(targetVerseNumber);
        if (Number.isInteger(normalizedChapterId) && Number.isInteger(normalizedVerseNumber)) {
          resolvedStartingVerseKey = makeVerseKey(normalizedChapterId, normalizedVerseNumber);
        }
      }
    } else if (quranReaderDataType === QuranReaderDataType.Chapter && chapterId) {
      const startingVerseNumber = Number(startingVerseValue); // Parse legacy chapter-only format "V".
      const isValidStartingVerse =
        Number.isInteger(startingVerseNumber) &&
        // Validate numeric verse against the current chapter bounds.
        isValidVerseId(chaptersData, chapterId, startingVerseValue);
      if (isValidStartingVerse) {
        resolvedStartingVerseKey = makeVerseKey(chapterId, startingVerseNumber);
      }
    }

    if (!resolvedStartingVerseKey) {
      setStartingVerseHighlightVerseKey(undefined);
      return undefined;
    }

    setStartingVerseHighlightVerseKey(resolvedStartingVerseKey);

    // After a few seconds, remove the highlight
    const removeTimeoutId = setTimeout(() => {
      setStartingVerseHighlightVerseKey(undefined);
    }, STARTING_VERSE_HIGHLIGHT_DURATION_MS);

    return () => {
      clearTimeout(removeTimeoutId);
    };
  }, [
    chapterId,
    chaptersData,
    isVerseAudioPlaying,
    quranReaderDataType,
    readingPreference,
    startingVerse,
  ]);

  const { quranFont, mushafLines, quranTextFontScale } = quranReaderStyles;
  useQcfFont(quranFont, verses);
  const { pagesCount, hasError, pagesVersesRange, isLoading } = useFetchPagesLookup(
    resourceId,
    quranReaderDataType,
    initialData,
    quranReaderStyles,
    isUsingDefaultFont,
  );
  const virtuosoRef = useRef<VirtuosoHandle>(null);

  const { scrollToPreviousPage, scrollToNextPage } = usePageNavigation({
    pagesVersesRange,
    lastReadPageNumber,
    pagesCount,
    virtuosoRef,
  });

  useScrollToVirtualizedVerse(
    quranReaderDataType,
    virtuosoRef,
    initialData,
    quranReaderStyles,
    verses,
    pagesVersesRange,
    isUsingDefaultFont,
    quranFont,
    mushafLines,
    isLoading,
  );

  const onPrevPageClicked = useCallback(() => {
    logButtonClick('reading_view_prev_page_button');
    scrollToPreviousPage();
  }, [scrollToPreviousPage]);

  const onNextPageClicked = useCallback(() => {
    logButtonClick('reading_view_next_page_button');
    scrollToNextPage();
  }, [scrollToNextPage]);

  const allowKeyboardNavigation = quranTextFontScale <= 5;
  const onUpClicked = useCallback(
    (event: KeyboardEvent) => {
      event.preventDefault();
      scrollToPreviousPage();
    },
    [scrollToPreviousPage],
  );

  const onDownClicked = useCallback(
    (event: KeyboardEvent) => {
      event.preventDefault();
      scrollToNextPage();
    },
    [scrollToNextPage],
  );

  useHotkeys('Up', onUpClicked, { enabled: allowKeyboardNavigation }, [scrollToPreviousPage]);
  useHotkeys('Down', onDownClicked, { enabled: allowKeyboardNavigation }, [scrollToNextPage]);

  // This context is used to pass the starting verse highlight information to the PageContainer
  const startingVerseHighlightContextValue = useMemo(
    () => ({
      verseKey: startingVerseHighlightVerseKey,
    }),
    [startingVerseHighlightVerseKey],
  );

  const itemContentRenderer = (pageIndex: number) => {
    if (pageIndex === pagesCount) {
      const pageVerses = mushafPageToVersesMap[lastReadPageNumber];
      const lastVerse = pageVerses?.[pageVerses.length - 1];
      if (!lastVerse) return null;

      return (
        <EndOfScrollingControls
          quranReaderDataType={quranReaderDataType}
          lastVerse={lastVerse}
          initialData={initialData}
        />
      );
    }

    return (
      <PageContainer
        pagesVersesRange={pagesVersesRange}
        quranReaderStyles={quranReaderStyles}
        reciterId={reciterId}
        lang={lang}
        wordByWordLocale={wordByWordLocale}
        pageIndex={pageIndex}
        setMushafPageToVersesMap={setMushafPageToVersesMap}
        initialData={initialData}
        readingPreference={readingPreference}
      />
    );
  };

  if (hasError) {
    return <Error />;
  }

  const shouldShowQueryParamMessage =
    reciterQueryParamDifferent || wordByWordLocaleQueryParamDifferent;

  // When in empty state, show mode actions and empty message
  // Only show ReadingModeActions here if ReaderTopActions wouldn't show them (to avoid duplicate)
  if (showEmptyState) {
    return (
      <div className={styles.emptyStateContainer}>
        {!readerTopActionsWouldShow && (
          <div className={styles.emptyStateActions}>
            <ReadingModeActions />
          </div>
        )}
        <EmptyTranslationMessage />
      </div>
    );
  }

  return (
    <StartingVerseHighlightContext.Provider value={startingVerseHighlightContextValue}>
      {shouldShowQueryParamMessage && (
        <QueryParamMessage
          translationsQueryParamDifferent={false}
          reciterQueryParamDifferent={reciterQueryParamDifferent}
          wordByWordLocaleQueryParamDifferent={wordByWordLocaleQueryParamDifferent}
        />
      )}
      <div
        onCopy={(event) => onCopyQuranWords(event, verses, quranFont)}
        className={classNames(
          styles.container,
          styles[getLineWidthClassName(quranFont, quranTextFontScale, mushafLines)],
        )}
      >
        {isLoading ? (
          <div className={styles.virtuosoScroller}>
            <ReadingViewSkeleton readingPreference={readingPreference} />
          </div>
        ) : (
          <Virtuoso
            ref={virtuosoRef}
            useWindowScroll
            increaseViewportBy={INCREASE_VIEWPORT_BY_PIXELS}
            className={styles.virtuosoScroller}
            initialItemCount={1} // needed for SSR.
            totalCount={pagesCount + 1}
            itemContent={itemContentRenderer}
          />
        )}
      </div>
      {allowKeyboardNavigation && (
        <PageNavigationButtons
          scrollToNextPage={onNextPageClicked}
          scrollToPreviousPage={onPrevPageClicked}
        />
      )}
    </StartingVerseHighlightContext.Provider>
  );
};

export default ReadingView;
