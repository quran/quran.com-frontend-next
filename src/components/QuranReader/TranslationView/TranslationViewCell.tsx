import classNames from 'classnames';
import Link from 'next/link';
import React from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import ChapterHeader from 'src/components/chapters/ChapterHeader';
import VerseActions from 'src/components/Verse/VerseActions';
import VerseText from 'src/components/Verse/VerseText';
import { QuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import Translation from 'types/Translation';
import Verse from 'types/Verse';
import selectVerseHighlightStatus from '../selectVerseHighlightStatus';
import styles from './TranslationViewCell.module.scss';

interface TranslatioViewCellProps {
  verse: Verse;
  quranReaderStyles: QuranReaderStyles;
}
const TranslationViewCell: React.FC<TranslatioViewCellProps> = ({ verse, quranReaderStyles }) => {
  const { isVerseHighlighted, wordPosition } = useSelector(
    (state) => selectVerseHighlightStatus(state, verse),
    shallowEqual,
  );
  return (
    <div key={verse.id}>
      {verse.verseNumber === 1 && <ChapterHeader chapterId={String(verse.chapterId)} />}
      <div
        className={classNames({
          [styles.highlightedContainer]: isVerseHighlighted,
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
          highlightedWordPosition={isVerseHighlighted ? wordPosition : null}
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

export default TranslationViewCell;
