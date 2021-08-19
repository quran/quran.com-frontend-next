import classNames from 'classnames';
import React from 'react';
import { useSelector } from 'react-redux';
import ChapterHeader from 'src/components/chapters/ChapterHeader';
import VerseActions from 'src/components/Verse/VerseActions';
import VerseLink from 'src/components/Verse/VerseLink';
import VerseText from 'src/components/Verse/VerseText';
import { selectQuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import Translation from 'types/Translation';
import Verse from 'types/Verse';
import {
  selectIsVerseHighlighted,
  selectHighlightedWordPosition,
} from '../selectVerseHighlightStatus';
import styles from './TranslationViewCell.module.scss';

interface TranslatioViewCellProps {
  verse: Verse;
}
const TranslationViewCell: React.FC<TranslatioViewCellProps> = ({ verse }) => {
  const quranReaderStyles = useSelector(selectQuranReaderStyles);
  const isVerseHighlighted = useSelector((state) => selectIsVerseHighlighted(state, verse));
  const wordPosition = useSelector((state) =>
    selectHighlightedWordPosition(state, verse.timestamps.segments),
  );

  return (
    <div key={verse.id}>
      {verse.verseNumber === 1 && <ChapterHeader chapterId={String(verse.chapterId)} />}
      <div
        className={classNames({
          [styles.highlightedContainer]: isVerseHighlighted,
        })}
      >
        <VerseLink verseKey={verse.verseKey} />
        <VerseActions verse={verse} />
        <VerseText
          words={verse.words}
          highlightedVerseKey={isVerseHighlighted && verse.verseKey}
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
