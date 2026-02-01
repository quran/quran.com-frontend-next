import React, { useMemo } from 'react';

import classNames from 'classnames';
import { shallowEqual, useSelector } from 'react-redux';

import groupLinesByVerses from './groupLinesByVerses';
import Line from './Line';
import styles from './Page.module.scss';
import PageFooter from './PageFooter';
import TranslationPage from './TranslationPage';

import ChapterHeader from '@/components/chapters/ChapterHeader';
import useIsFontLoaded from '@/components/QuranReader/hooks/useIsFontLoaded';
import {
  selectInlineDisplayWordByWordPreferences,
  selectReadingPreference,
} from '@/redux/slices/QuranReader/readingPreferences';
import QuranReaderStyles from '@/redux/types/QuranReaderStyles';
import { FALLBACK_FONT, ReadingPreference } from '@/types/QuranReader';
import { getLineWidthClassName } from '@/utils/fontFaceHelper';
import Verse from 'types/Verse';

type PageProps = {
  verses: Verse[];
  pageNumber: number;
  quranReaderStyles: QuranReaderStyles;
  pageIndex: number;
  bookmarksRangeUrl: string | null;
  lang: string;
};

const Page = ({
  verses,
  pageNumber,
  quranReaderStyles,
  pageIndex,
  bookmarksRangeUrl,
  lang,
}: PageProps) => {
  const readingPreference = useSelector(selectReadingPreference);

  const lines = useMemo(() => (verses?.length > 0 ? groupLinesByVerses(verses) : {}), [verses]);
  const { quranTextFontScale, quranFont, mushafLines } = quranReaderStyles;
  const { showWordByWordTranslation, showWordByWordTransliteration } = useSelector(
    selectInlineDisplayWordByWordPreferences,
    shallowEqual,
  );
  const isWordByWordLayout = showWordByWordTranslation || showWordByWordTransliteration;
  const isBigTextLayout = isWordByWordLayout || quranTextFontScale > 3;
  const isFontLoaded = useIsFontLoaded(pageNumber, quranFont);

  // Check if this page contains the first verse of a chapter (for chapter header)
  const firstVerse = verses?.[0];
  const shouldShowChapterHeader = firstVerse?.verseNumber === 1;
  const chapterId = firstVerse?.chapterId?.toString();

  const isReadingTranslation = readingPreference === ReadingPreference.ReadingTranslation;

  // Render the chapter header at page level to prevent re-mounting when switching modes
  const chapterHeader = shouldShowChapterHeader && chapterId && (
    <ChapterHeader chapterId={chapterId} isTranslationView={false} />
  );

  // Render translation-only page for "Reading - Translation" mode
  if (isReadingTranslation) {
    return (
      <div id={`page-${pageNumber}`} className={styles.translationPageContainer}>
        {chapterHeader}
        <TranslationPage
          verses={verses}
          pageNumber={pageNumber}
          lang={lang}
          pageHeaderChapterId={shouldShowChapterHeader ? chapterId : undefined}
        />
      </div>
    );
  }

  return (
    <div
      id={`page-${pageNumber}`}
      className={classNames(styles.container, {
        [styles.mobileCenterText]: isBigTextLayout,
        [styles[getLineWidthClassName(FALLBACK_FONT, quranTextFontScale, mushafLines, true)]]:
          !isFontLoaded,
      })}
    >
      {chapterHeader}
      <div className={styles.linesContainer}>
        {Object.keys(lines).map((key, lineIndex) => (
          <Line
            pageIndex={pageIndex}
            lineIndex={lineIndex}
            lineKey={key}
            words={lines[key]}
            key={key}
            isBigTextLayout={isBigTextLayout}
            quranReaderStyles={quranReaderStyles}
            bookmarksRangeUrl={bookmarksRangeUrl}
            pageHeaderChapterId={shouldShowChapterHeader ? chapterId : undefined}
          />
        ))}
      </div>
      <PageFooter page={pageNumber} />
    </div>
  );
};

export default Page;
