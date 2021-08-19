/* eslint-disable react/no-danger */
import React from 'react';
import { QuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import Link from 'next/link';
import VerseActions from 'src/components/Verse/VerseActions';
import classNames from 'classnames';
import ChapterHeader from 'src/components/chapters/ChapterHeader';
import { shallowEqual, useSelector } from 'react-redux';
import Verse from '../../../../types/Verse';
import VerseText from '../../Verse/VerseText';
import Translation from '../../../../types/Translation';
import styles from './TranslationView.module.scss';
import selectVerseHighlightStatus from '../selectVerseHighlightStatus';

type TranslationViewProps = {
  verses: Verse[];
  quranReaderStyles: QuranReaderStyles;
};

// useSelector inside RenderVerse, for individual verse
// instead of using useSelector in TranslationView
// so only one verse get re rendered when the highlight changes
const RenderVerse = ({
  verse,
  quranReaderStyles,
}: {
  verse: Verse;
  quranReaderStyles: QuranReaderStyles;
}) => {
  const { verseHighlighted, wordPosition } = useSelector(
    (state) => selectVerseHighlightStatus(state, verse),
    shallowEqual,
  );
  return (
    <div key={verse.id}>
      {verse.verseNumber === 1 && <ChapterHeader chapterId={String(verse.chapterId)} />}
      <div
        className={classNames({
          [styles.highlightedContainer]: verseHighlighted,
        })}
      >
        <Link
          as={`/${verse.chapterId}/${verse.verseNumber}`}
          href="/[chapterId]/[verseId]"
          passHref
        >
          <p className={styles.verseLink}>{verse.verseKey}</p>
        </Link>
        <VerseActions verse={verse} />
        <VerseText
          words={verse.words}
          highlightedWordPosition={verseHighlighted ? wordPosition : null}
        />
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
  );
};

const TranslationView = ({ verses, quranReaderStyles }: TranslationViewProps) => (
  <div className={styles.container}>
    {verses.map((verse) => (
      <RenderVerse verse={verse} key={verse.id} quranReaderStyles={quranReaderStyles} />
    ))}
  </div>
);

export default TranslationView;
