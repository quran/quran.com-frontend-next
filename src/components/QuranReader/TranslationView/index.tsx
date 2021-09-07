import React from 'react';
import { QuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import VerseActions from 'src/components/Verse/VerseActions';
import classNames from 'classnames';
import ChapterHeader from 'src/components/chapters/ChapterHeader';
import VerseLink from 'src/components/Verse/VerseLink';
import VerseText from 'src/components/Verse/VerseText';
import Separator from 'src/components/dls/Separator/Separator';
import Verse from '../../../../types/Verse';
import Translation from '../../../../types/Translation';
import styles from './TranslationView.module.scss';
import BookmarkIcon from './BookmarkIcon';
import TranslationText from './TranslationText';

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
            <VerseLink verseKey={verse.verseKey} />
            <VerseActions verse={verse} />
          </div>
          <div className={styles.contentContainer}>
            <BookmarkIcon verseKey={verse.verseKey} />
            <div className={styles.verseContainer}>
              <VerseText words={verse.words} />
            </div>
            {verse.translations?.map((translation: Translation) => (
              <div key={translation.id} className={styles.verseContainer}>
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
