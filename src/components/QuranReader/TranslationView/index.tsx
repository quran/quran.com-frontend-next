/* eslint-disable react/no-danger */
import React from 'react';
import { QuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import VerseActions from 'src/components/Verse/VerseActions';
import classNames from 'classnames';
import ChapterHeader from 'src/components/chapters/ChapterHeader';
import VerseLink from 'src/components/Verse/VerseLink';
import Chapter from 'types/Chapter';
import Verse from '../../../../types/Verse';
import VerseText from '../../Verse/VerseText';
import Translation from '../../../../types/Translation';
import styles from './TranslationView.module.scss';
import BookmarkIcon from './BookmarkIcon';

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
            <VerseLink verseKey={verse.verseKey} />
            <VerseActions verse={verse} />
          </div>
          <div className={styles.contentContainer}>
            <BookmarkIcon verseKey={verse.verseKey} />
            <div className={styles.verseContainer}>
              <VerseText words={verse.words} chapters={chapters} />
            </div>
            {verse.translations?.map((translation: Translation) => (
              <div key={translation.id} className={styles.verseContainer}>
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
          </div>
        </div>
        <div className={styles.divider} />
      </div>
    ))}
  </div>
);

export default TranslationView;
