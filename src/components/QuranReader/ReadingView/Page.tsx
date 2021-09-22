import React, { useMemo } from 'react';

import classNames from 'classnames';
import { shallowEqual, useSelector } from 'react-redux';

import groupLinesByVerses from './groupLinesByVerses';
import Line from './Line';
import styles from './Page.module.scss';
import PageFooter from './PageFooter';

import { selectHighlightedLocation } from 'src/redux/slices/QuranReader/highlightedLocation';
import { selectWordByWordByWordPreferences } from 'src/redux/slices/QuranReader/readingPreferences';
import { QuranReaderStyles, selectQuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import Verse from 'types/Verse';

type PageProps = {
  verses: Verse[];
  page: number;
};

const Page = ({ verses, page }: PageProps) => {
  const lines = useMemo(() => groupLinesByVerses(verses), [verses]);
  const { quranTextFontScale } = useSelector(
    selectQuranReaderStyles,
    shallowEqual,
  ) as QuranReaderStyles;
  const { showWordByWordTranslation, showWordByWordTransliteration } = useSelector(
    selectWordByWordByWordPreferences,
    shallowEqual,
  );
  const isWordByWordLayout = showWordByWordTranslation || showWordByWordTransliteration;
  const isBigTextLayout = isWordByWordLayout || quranTextFontScale > 3;
  const { highlightedChapter, highlightedVerse } = useSelector(selectHighlightedLocation);

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
          isHighlighted={lines[key].some(
            (word) => word.verseKey === `${highlightedChapter}:${highlightedVerse}`,
          )}
        />
      ))}
      <PageFooter page={page} />
    </div>
  );
};

export default React.memo(Page);
