import React from 'react';
import { QuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import VerseActions from 'src/components/Verse/VerseActions';
import classNames from 'classnames';
import ChapterHeader from 'src/components/chapters/ChapterHeader';
import VerseLink from 'src/components/Verse/VerseLink';
import Chapter from 'types/Chapter';
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
  chapters: Record<string, Chapter>;
};

const TranslationView = ({ verses, quranReaderStyles, chapters }: TranslationViewProps) => (
  <div className={styles.container}>
    {verses.map((verse) => (
      <div key={verse.id}>
        {verse.verseNumber === 1 && (
          <ChapterHeader
            chapterId={String(verse.chapterId)}
            nameSimple={chapters[verse.chapterId.toString()].nameSimple}
            translatedName={chapters[verse.chapterId.toString()].translatedName.name}
          />
        )}
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
            <div className={styles.verseContainer}>
              <VerseText words={verse.words} chapters={chapters} />
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
