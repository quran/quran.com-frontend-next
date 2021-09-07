import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { QuranReaderStyles, selectQuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import classNames from 'classnames';
import { selectReadingPreferences } from 'src/redux/slices/QuranReader/readingPreferences';
import Chapter from 'types/Chapter';
import Verse from '../../../../types/Verse';
import Line from './Line';
import groupLinesByVerses from './groupLinesByVerses';
import styles from './Page.module.scss';
import PageFooter from './PageFooter';

type PageProps = {
  verses: Verse[];
  page: number;
  chapters: Record<string, Chapter>;
};

const Page = ({ verses, page, chapters }: PageProps) => {
  const lines = useMemo(() => groupLinesByVerses(verses), [verses]);
  const { quranTextFontScale } = useSelector(selectQuranReaderStyles) as QuranReaderStyles;
  const { showWordByWordTranslation, showWordByWordTransliteration } =
    useSelector(selectReadingPreferences);
  const isWordByWordLayout = showWordByWordTranslation || showWordByWordTransliteration;
  const isBigTextLayout = isWordByWordLayout || quranTextFontScale > 3;

  return (
    <div
      id={`page-${page}`}
      className={classNames(styles.container, { [styles.mobileCenterText]: isBigTextLayout })}
    >
      {Object.keys(lines).map((key) => (
        <Line
          chapters={chapters}
          lineKey={key}
          words={lines[key]}
          key={key}
          isBigTextLayout={isBigTextLayout}
        />
      ))}
      <PageFooter page={page} />
    </div>
  );
};

export default React.memo(Page);
