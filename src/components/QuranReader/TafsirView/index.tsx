/* eslint-disable react/no-danger */
import classNames from 'classnames';
import React from 'react';
import { useSelector } from 'react-redux';
import VerseText from 'src/components/Verse/VerseText';
import { QuranReaderStyles, selectQuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import { getWordsWithHelperData } from 'src/utils/verse';
import Verse from 'types/Verse';
import styles from './TafsirView.module.scss';

interface Props {
  verse: Verse;
}

const TafsirView: React.FC<Props> = ({ verse }) => {
  const quranReaderStyles = useSelector(selectQuranReaderStyles) as QuranReaderStyles;
  return (
    <div className={styles.container}>
      <VerseText words={getWordsWithHelperData(verse)} />
      {verse.tafsirs?.map((tafsir) => (
        <div key={tafsir.id}>
          {tafsir.resourceName && <p className={styles.tafsirName}>{tafsir.resourceName}</p>}
          <div
            className={classNames(
              styles.tafsirContainer,
              styles[`tafsir-font-size-${quranReaderStyles.tafsirFontScale}`],
            )}
            dangerouslySetInnerHTML={{ __html: tafsir.text }}
          />
        </div>
      ))}
    </div>
  );
};

export default TafsirView;
