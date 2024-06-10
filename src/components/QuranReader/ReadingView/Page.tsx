import React, { useMemo } from 'react';

import classNames from 'classnames';
import { shallowEqual, useSelector } from 'react-redux';

import groupLinesByVerses from './groupLinesByVerses';
import Line from './Line';
import styles from './Page.module.scss';
import PageFooter from './PageFooter';

import useIsFontLoaded from '@/components/QuranReader/hooks/useIsFontLoaded';
import { selectInlineDisplayWordByWordPreferences } from '@/redux/slices/QuranReader/readingPreferences';
import QuranReaderStyles from '@/redux/types/QuranReaderStyles';
import { getLineWidthClassName } from '@/utils/fontFaceHelper';
import { FALLBACK_FONT } from 'types/QuranReader';
import Verse from 'types/Verse';

type PageProps = {
  verses: Verse[];
  pageNumber: number;
  quranReaderStyles: QuranReaderStyles;
  pageIndex: number;
};

const Page = ({ verses, pageNumber, quranReaderStyles, pageIndex }: PageProps) => {
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
  );
};

export default Page;
