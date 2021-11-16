/* eslint-disable react/no-danger */

import React from 'react';

import classNames from 'classnames';
import { shallowEqual, useSelector } from 'react-redux';

import styles from './TafsirView.module.scss';

import VerseText from 'src/components/Verse/VerseText';
import { selectQuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import QuranReaderStyles from 'src/redux/types/QuranReaderStyles';
import { getVerseWords } from 'src/utils/verse';
import Verse from 'types/Verse';

interface Props {
  verse: Verse;
}

const RTL_LANGUAGES = [
  'urdu',
  'persian',
  'hebrew',
  'pashto',
  'arabic',
  'divehi',
  'dhivehi',
  'uyghur',
  'uighur',
];

const TafsirView: React.FC<Props> = ({ verse }) => {
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual) as QuranReaderStyles;
  return (
    <div className={styles.container}>
      <VerseText words={getVerseWords(verse)} />
      {verse.tafsirs?.map((tafsir) => {
        const isRtl = RTL_LANGUAGES.includes(tafsir.languageName);
        return (
          <div key={tafsir.id}>
            {tafsir.resourceName && (
              <p className={classNames(styles.tafsirName, { [styles.rtl]: isRtl })}>
                {tafsir.resourceName}
              </p>
            )}
            <div
              className={classNames(
                styles.tafsirContainer,
                styles[`tafsir-font-size-${quranReaderStyles.tafsirFontScale}`],
                { [styles.rtl]: isRtl },
              )}
              dangerouslySetInnerHTML={{ __html: tafsir.text }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default TafsirView;
