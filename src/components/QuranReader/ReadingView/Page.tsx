import React, { useMemo, memo } from 'react';

import classNames from 'classnames';
import { shallowEqual, useSelector } from 'react-redux';

import { verseFontChanged } from '../utils/memoization';

import groupLinesByVerses from './groupLinesByVerses';
import Line from './Line';
import styles from './Page.module.scss';
import PageFooter from './PageFooter';

import { selectWordByWordByWordPreferences } from 'src/redux/slices/QuranReader/readingPreferences';
import QuranReaderStyles from 'src/redux/types/QuranReaderStyles';
import { QuranFont } from 'types/QuranReader';
import Verse from 'types/Verse';

type PageProps = {
  verses: Verse[];
  page: number;
  quranReaderStyles: QuranReaderStyles;
};

const Page = ({ verses, page, quranReaderStyles }: PageProps) => {
  const lines = useMemo(() => groupLinesByVerses(verses), [verses]);
  const { quranTextFontScale, quranFont } = quranReaderStyles;
  const { showWordByWordTranslation, showWordByWordTransliteration } = useSelector(
    selectWordByWordByWordPreferences,
    shallowEqual,
  );
  const isWordByWordLayout = showWordByWordTranslation || showWordByWordTransliteration;
  const isBigTextLayout =
    isWordByWordLayout || quranTextFontScale > 3 || quranFont === QuranFont.Tajweed;

  return (
    <div
      id={`page-${page}`}
      className={classNames(styles.container, { [styles.mobileCenterText]: isBigTextLayout })}
    >
      {Object.keys(lines).map((key) => (
        <Line
          lineKey={key}
          words={lines[key]}
          key={key}
          isBigTextLayout={isBigTextLayout}
          quranReaderStyles={quranReaderStyles}
        />
      ))}
      <PageFooter page={page} />
    </div>
  );
};

/**
 * Since we are passing verses and it's an array
 * even if the same verses are passed, their reference will change
 * on fetching a new page and since Memo only does shallow comparison,
 * we need to use custom comparing logic:
 *
 *  1. Check if the page numbers are the same.
 *  2. Check if the number of verses are the same.
 *  3. Check if the font changed.
 *
 * If the above conditions are met, it's safe to assume that the result
 * of both renders are the same.
 *
 * @param {PageProps} prevProps
 * @param {PageProps} nextProps
 * @returns {boolean}
 */
const arePagesEqual = (prevProps: PageProps, nextProps: PageProps): boolean =>
  prevProps.page === nextProps.page &&
  prevProps.verses.length === nextProps.verses.length &&
  !verseFontChanged(
    prevProps.quranReaderStyles,
    nextProps.quranReaderStyles,
    prevProps.verses[0].words,
    nextProps.verses[0].words,
  );

export default memo(Page, arePagesEqual);
