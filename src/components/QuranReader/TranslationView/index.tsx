import React from 'react';

import classNames from 'classnames';

import Translation from '../../../../types/Translation';
import Verse from '../../../../types/Verse';

import BookmarkIcon from './BookmarkIcon';
import TranslationText from './TranslationText';
import styles from './TranslationView.module.scss';

import ChapterHeader from 'src/components/chapters/ChapterHeader';
import Separator from 'src/components/dls/Separator/Separator';
import VerseActions from 'src/components/Verse/VerseActions';
import VerseLink from 'src/components/Verse/VerseLink';
import VerseText from 'src/components/Verse/VerseText';
import { QuranReaderStyles } from 'src/redux/slices/QuranReader/styles';

type TranslationViewProps = {
  verses: Verse[];
  quranReaderStyles: QuranReaderStyles;
};

const TranslationView = ({ verses, quranReaderStyles }: TranslationViewProps) => (
  <div className={styles.container}>
    {verses.map((verse) => (
      <div key={verse.id}>
        {verse.verseNumber === 1 && <ChapterHeader chapterId={String(verse.chapterId)} />}
        <div className={classNames(styles.cellContainer, { [styles.highlightedContainer]: false })}>
          <div className={styles.actionContainer}>
            <div className={styles.actionContainerLeft}>
              <div className={styles.actionItem}>
                <VerseLink verseKey={verse.verseKey} />
              </div>
              <div className={styles.actionItem}>
                <BookmarkIcon verseKey={verse.verseKey} />
              </div>
            </div>
            <div className={styles.actionContainerRight}>
              <div className={styles.actionItem}>
                <VerseActions verse={verse} />
              </div>
            </div>
          </div>

          <div className={styles.contentContainer}>
            <div className={styles.arabicVerseContainer}>
              <VerseText words={verse.words} />
            </div>
            {verse.translations?.map((translation: Translation) => (
              <div key={translation.id} className={styles.verseTranslationContainer}>
                <TranslationText
                  translationFontScale={quranReaderStyles.translationFontScale}
                  text={translation.text}
                />
                <p className={styles.translationName}>— {translation.resourceName}</p>
              </div>
            ))}
          </div>
        </div>
        <Separator />
      </div>
    ))}
  </div>
);

export default TranslationView;
