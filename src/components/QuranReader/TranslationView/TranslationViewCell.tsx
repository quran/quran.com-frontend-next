import classNames from 'classnames';
import { shallowEqual, useSelector } from 'react-redux';

import BookmarkIcon from './BookmarkIcon';
import TranslationText from './TranslationText';
import styles from './TranslationViewCell.module.scss';

import ChapterHeader from 'src/components/chapters/ChapterHeader';
import Separator from 'src/components/dls/Separator/Separator';
import OverflowVerseActionsMenu from 'src/components/Verse/OverflowVerseActionsMenu';
import PlayVerseAudioButton from 'src/components/Verse/PlayVerseAudioButton';
import VerseLink from 'src/components/Verse/VerseLink';
import VerseText from 'src/components/Verse/VerseText';
import { selectQuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import { getVerseWords } from 'src/utils/verse';
import Translation from 'types/Translation';
import Verse from 'types/Verse';

type TranslationViewCellProps = {
  verse: Verse;
  isHighlighted: boolean;
};

const TranslationViewCell = ({ verse, isHighlighted }: TranslationViewCellProps) => {
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);

  return (
    <div>
      {verse.verseNumber === 1 && (
        <ChapterHeader
          chapterId={String(verse.chapterId)}
          pageNumber={verse.pageNumber}
          hizbNumber={verse.hizbNumber}
        />
      )}
      <div
        className={classNames(styles.cellContainer, {
          [styles.highlightedContainer]: isHighlighted,
        })}
      >
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
              <PlayVerseAudioButton
                timestamp={verse.timestamps.timestampFrom}
                chapterId={Number(verse.chapterId)}
              />
            </div>
            <div className={styles.actionItem}>
              <OverflowVerseActionsMenu verse={verse} />
            </div>
          </div>
        </div>

        <div className={styles.contentContainer}>
          <div className={styles.arabicVerseContainer}>
            <VerseText words={getVerseWords(verse)} />
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
  );
};

export default TranslationViewCell;
