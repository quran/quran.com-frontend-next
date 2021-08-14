import React from 'react';
import Word from 'types/Word';
import VerseText from 'src/components/Verse/VerseText';
import styles from './Line.module.scss';

type LineProps = {
  words: Word[];
};

const Line = ({ words }: LineProps) => {
  const { lineNumber } = words[0];

  return (
    <div id={`line-${lineNumber}`} className={styles.container}>
      <div className={styles.line}>
        <VerseText words={words} />
      </div>
    </div>
  );
};

export default React.memo(Line);
