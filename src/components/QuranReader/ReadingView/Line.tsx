import React from 'react';
import Word from 'types/Word';
import VerseText from 'src/components/Verse/VerseText';
import styles from './Line.module.scss';

type LineProps = {
  words: Word[];
  lineKey: string;
};

const Line = ({ lineKey, words }: LineProps) => (
  <span id={lineKey} className={styles.container}>
    <span className={styles.line}>
      <VerseText words={words} isReadingMode />
    </span>
  </span>
);

export default React.memo(Line);
