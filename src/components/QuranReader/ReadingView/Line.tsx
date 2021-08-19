import React from 'react';
import Word from 'types/Word';
import VerseText from 'src/components/Verse/VerseText';
import styles from './Line.module.scss';

type LineProps = {
  words: Word[];
  lineKey: string;
  highlightedVerseKey: string;
  highlightedWordPosition: number;
};

const Line = ({ lineKey, words, highlightedVerseKey, highlightedWordPosition }: LineProps) => (
  <div id={lineKey} className={styles.container}>
    <div className={styles.line}>
      <VerseText
        words={words}
        isReadingMode
        highlightedWordPosition={highlightedWordPosition}
        highlightedVerseKey={highlightedVerseKey}
      />
    </div>
  </div>
);

export default React.memo(Line);
