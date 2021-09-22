/* eslint-disable react/no-danger */

import React from 'react';

import classNames from 'classnames';
import { shallowEqual, useSelector } from 'react-redux';

import styles from './TafsirView.module.scss';

import VerseText from 'src/components/Verse/VerseText';
import { QuranReaderStyles, selectQuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import { getVerseWords } from 'src/utils/verse';
import Verse from 'types/Verse';

interface Props {
  verse: Verse;
}

const TafsirView: React.FC<Props> = ({ verse }) => {
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual) as QuranReaderStyles;
  return (
    <div className={styles.container}>
      <VerseText words={getVerseWords(verse)} />
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
