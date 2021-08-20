import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import Verse from '../../../../types/Verse';
import Line from './Line';
import groupLinesByVerses from './groupLinesByVerses';
import styles from './Page.module.scss';
import PageFooter from './PageFooter';
import {
  selectHighlightedVerseKey,
  selectHighlightedWordPosition,
} from '../selectVerseHighlightStatus';

type PageProps = {
  verses: Verse[];
  page: number;
};

const Page = ({ verses, page }: PageProps) => {
  const lines = useMemo(() => groupLinesByVerses(verses), [verses]);
  const highlightedVerseKey = useSelector((state) => selectHighlightedVerseKey(state, verses));
  const highlightedVerse = useMemo(
    () => verses.find((v) => v.verseKey === highlightedVerseKey),
    [highlightedVerseKey, verses],
  );
  const highlightedWordPosition = useSelector((state) =>
    selectHighlightedWordPosition(state, highlightedVerse?.timestamps?.segments),
  );

  return (
    <div id={`page-${page}`} className={styles.container}>
      {Object.keys(lines).map((key) => (
        <Line
          lineKey={key}
          words={lines[key]}
          key={key}
          highlightedVerseKey={highlightedVerseKey}
          highlightedWordPosition={highlightedWordPosition}
        />
      ))}
      <PageFooter page={page} />
    </div>
  );
};

export default React.memo(Page);
