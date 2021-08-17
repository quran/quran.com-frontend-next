import React from 'react';
import Word from 'types/Word';
import VerseText from 'src/components/Verse/VerseText';
import styles from './Line.module.scss';

type LineProps = {
  words: Word[];
  lineKey: string;
};

const Line = ({ lineKey, words }: LineProps) => (
  <div id={lineKey} className={styles.container}>
    <div className={styles.line}>
      <VerseText words={words} isReadingMode />
    </div>
  </div>
);

export default React.memo(Line);
