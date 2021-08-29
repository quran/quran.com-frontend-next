/* eslint-disable react/no-danger */
import React from 'react';
import { QuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import VerseActions from 'src/components/Verse/VerseActions';
import classNames from 'classnames';
import ChapterHeader from 'src/components/chapters/ChapterHeader';
import VerseLink from 'src/components/Verse/VerseLink';
import Button, { ButtonSize, ButtonVariant } from 'src/components/dls/Button/Button';
import { useSelector } from 'react-redux';
import { selectBookmarks } from 'src/redux/slices/QuranReader/bookmarks';
import Verse from '../../../../types/Verse';
import VerseText from '../../Verse/VerseText';
import Translation from '../../../../types/Translation';
import styles from './TranslationView.module.scss';
import StarIcon from '../../../../public/icons/star.svg';

type TranslationViewProps = {
  verses: Verse[];
  quranReaderStyles: QuranReaderStyles;
};

const BookmarkIcon = ({ verseKey }: { verseKey: string }) => {
  const { bookmarkedVerses } = useSelector(selectBookmarks);
  const isVerseBookmarked = !!bookmarkedVerses[verseKey];

  if (!isVerseBookmarked) return null;

  return (
    <div className={styles.bookmarkIconContainer}>
      <Button size={ButtonSize.Small} variant={ButtonVariant.Ghost}>
        <StarIcon />
      </Button>
    </div>
  );
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
              <div key={translation.id}>
                <div
                  className={classNames(
                    styles.text,
                    styles.translationContainer,
                    styles[`translation-font-size-${quranReaderStyles.translationFontScale}`],
                  )}
                  dangerouslySetInnerHTML={{ __html: translation.text }}
                />
                <p className={styles.translationName}>— {translation.resourceName}</p>
              </div>
            ))}
          </div>
        </div>
        <hr />
      </div>
    ))}
  </div>
);

export default TranslationView;
