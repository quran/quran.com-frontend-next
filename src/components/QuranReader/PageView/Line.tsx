import React from 'react';
import { useSelector } from 'react-redux';
import { selectQuranReaderStyles, QuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import Word from 'types/Word';
import VerseText from 'src/components/Verse/VerseText';
import styles from './Line.module.scss';

type LineProps = {
  words: Word[];
};

const Line = ({ words }: LineProps) => {
  const quranReaderStyles = useSelector(selectQuranReaderStyles) as QuranReaderStyles;
  const { lineNumber } = words[0];

  // TODO (@abdellatif): make the vw dimension adaptive
  return (
    <div
      style={{
        fontSize: `min(5vw, ${quranReaderStyles.quranTextFontSize}rem)`,
      }}
      id={`line-${lineNumber}`}
      className={styles.container}
    >
      <div className={styles.line}>
        <VerseText words={words} />
      </div>
    </div>
  );
};

export default React.memo(Line);
