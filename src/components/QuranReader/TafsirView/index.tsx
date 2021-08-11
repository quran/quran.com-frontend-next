/* eslint-disable react/no-danger */
import React from 'react';
import { useSelector } from 'react-redux';
import VerseText from 'src/components/Verse/VerseText';
import { QuranReaderStyles, selectQuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import Verse from 'types/Verse';
import styles from './TafsirView.module.scss';

interface Props {
  verse: Verse;
}

const TafsirView: React.FC<Props> = ({ verse }) => {
  const quranReaderStyles = useSelector(selectQuranReaderStyles) as QuranReaderStyles;
  return (
    <div className={styles.container}>
      <VerseText words={verse.words} />
      {verse.tafsirs?.map((tafsir) => (
        <div key={tafsir.id}>
          {tafsir.name && <p className={styles.tafsirName}>{tafsir.name}</p>}
          <div
            className={styles.tafsirContainer}
            dangerouslySetInnerHTML={{ __html: tafsir.text }}
            style={{ fontSize: `${quranReaderStyles.tafsirFontSize}rem` }}
          />
        </div>
      ))}
    </div>
  );
};

export default TafsirView;
