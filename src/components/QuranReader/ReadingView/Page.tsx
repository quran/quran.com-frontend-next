import React, { useMemo } from 'react';

import classNames from 'classnames';
import { shallowEqual, useSelector } from 'react-redux';

import { PageQuestionsContext } from './context/PageQuestionsContext';
import groupLinesByVerses from './groupLinesByVerses';
import Line from './Line';
import styles from './Page.module.scss';
import PageFooter from './PageFooter';

import useIsFontLoaded from '@/components/QuranReader/hooks/useIsFontLoaded';
import useCountRangeQuestions from '@/hooks/auth/useCountRangeQuestions';
import { selectInlineDisplayWordByWordPreferences } from '@/redux/slices/QuranReader/readingPreferences';
import QuranReaderStyles from '@/redux/types/QuranReaderStyles';
import { FALLBACK_FONT } from '@/types/QuranReader';
import { getLineWidthClassName } from '@/utils/fontFaceHelper';
import Verse from 'types/Verse';

type PageProps = {
  verses: Verse[];
  pageNumber: number;
  quranReaderStyles: QuranReaderStyles;
  pageIndex: number;
};

const Page = ({ verses, pageNumber, quranReaderStyles, pageIndex }: PageProps) => {
  const { data: pageVersesQuestionsCount } = useCountRangeQuestions(
    verses && verses.length > 0
      ? {
          from: verses?.[0].verseKey,
          to: verses?.[verses.length - 1].verseKey,
        }
      : null,
  );
  const lines = useMemo(
    () => (verses && verses.length ? groupLinesByVerses(verses) : {}),
    [verses],
  );
  const { quranTextFontScale, quranFont, mushafLines } = quranReaderStyles;
  const { showWordByWordTranslation, showWordByWordTransliteration } = useSelector(
    selectInlineDisplayWordByWordPreferences,
    shallowEqual,
  );
  const isWordByWordLayout = showWordByWordTranslation || showWordByWordTransliteration;
  const isBigTextLayout = isWordByWordLayout || quranTextFontScale > 3;
  const isFontLoaded = useIsFontLoaded(pageNumber, quranFont);

  return (
    <PageQuestionsContext.Provider value={pageVersesQuestionsCount}>
      <div
        id={`page-${pageNumber}`}
        className={classNames(styles.container, {
          [styles.mobileCenterText]: isBigTextLayout,
          [styles[getLineWidthClassName(FALLBACK_FONT, quranTextFontScale, mushafLines, true)]]:
            !isFontLoaded,
        })}
      >
        {Object.keys(lines).map((key, lineIndex) => (
          <Line
            pageIndex={pageIndex}
            lineIndex={lineIndex}
            lineKey={key}
            words={lines[key]}
            key={key}
            isBigTextLayout={isBigTextLayout}
            quranReaderStyles={quranReaderStyles}
          />
        ))}
        <PageFooter page={pageNumber} />
      </div>
    </PageQuestionsContext.Provider>
  );
};

export default Page;
