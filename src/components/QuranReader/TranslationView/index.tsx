/* eslint-disable react/no-danger */
import React from 'react';
import { QuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import VerseActions from 'src/components/Verse/VerseActions';
import classNames from 'classnames';
import ChapterHeader from 'src/components/chapters/ChapterHeader';
import VerseLink from 'src/components/Verse/VerseLink';
import Verse from '../../../../types/Verse';
import VerseText from '../../Verse/VerseText';
import Translation from '../../../../types/Translation';
import styles from './TranslationView.module.scss';

type TranslationViewProps = {
  verses: Verse[];
  quranReaderStyles: QuranReaderStyles;
};

const TranslationView = ({ verses, quranReaderStyles }: TranslationViewProps) => (
  <div className={styles.container}>
    {verses.map((verse) => (
      <div key={verse.id}>
        {verse.verseNumber === 1 && <ChapterHeader chapterId={String(verse.chapterId)} />}
        <div className={classNames({ [styles.highlightedContainer]: false })}>
          <VerseLink verseKey={verse.verseKey} />
          <VerseActions verse={verse} />
          <VerseText words={verse.words} />
          {verse.translations?.map((translation: Translation) => (
            <div key={translation.id}>
              <div
                className={classNames(
                  styles.text,
                  styles[`translation-font-size-${quranReaderStyles.translationFontScale}`],
                )}
                dangerouslySetInnerHTML={{ __html: translation.text }}
              />
              <p className={styles.translationName}>— {translation.resourceName}</p>
            </div>
          ))}
          <hr />
        </div>
      </div>
    ))}
  </div>
);

export default TranslationView;
