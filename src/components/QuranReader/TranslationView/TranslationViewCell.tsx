import React, { RefObject, useEffect, memo } from 'react';

import classNames from 'classnames';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';

import BookmarkIcon from './BookmarkIcon';
import QuranReflectButton from './QuranReflectButton';
import ShareVerseButton from './ShareVerseButton';
import TranslationText from './TranslationText';
import styles from './TranslationViewCell.module.scss';

import Separator from 'src/components/dls/Separator/Separator';
import {
  verseFontChanged,
  verseTranslationChanged,
  verseTranslationFontChanged,
} from 'src/components/QuranReader/utils/memoization';
import OverflowVerseActionsMenu from 'src/components/Verse/OverflowVerseActionsMenu';
import PlayVerseAudioButton from 'src/components/Verse/PlayVerseAudioButton';
import VerseLink from 'src/components/Verse/VerseLink';
import VerseText from 'src/components/Verse/VerseText';
import useScroll, { SMOOTH_SCROLL_TO_CENTER } from 'src/hooks/useScrollToElement';
import { selectEnableAutoScrolling } from 'src/redux/slices/AudioPlayer/state';
import { selectIsVerseHighlighted } from 'src/redux/slices/QuranReader/highlightedLocation';
import QuranReaderStyles from 'src/redux/types/QuranReaderStyles';
import { getVerseWords } from 'src/utils/verse';
import Translation from 'types/Translation';
import Verse from 'types/Verse';

type TranslationViewCellProps = {
  verse: Verse;
  quranReaderStyles: QuranReaderStyles;
  verseIndex: number;
};

const TranslationViewCell: React.FC<TranslationViewCellProps> = ({
  verse,
  quranReaderStyles,
  verseIndex,
}) => {
  const router = useRouter();
  const { startingVerse } = router.query;

  const isHighlighted = useSelector(selectIsVerseHighlighted(verse.verseKey));
  const enableAutoScrolling = useSelector(selectEnableAutoScrolling);

  const [scrollToSelectedItem, selectedItemRef]: [() => void, RefObject<HTMLDivElement>] =
    useScroll(SMOOTH_SCROLL_TO_CENTER);

  useEffect(() => {
    if ((isHighlighted && enableAutoScrolling) || Number(startingVerse) === verseIndex + 1) {
      scrollToSelectedItem();
    }
  }, [isHighlighted, scrollToSelectedItem, enableAutoScrolling, startingVerse, verseIndex]);

  return (
    <div ref={selectedItemRef}>
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
            <div className={classNames(styles.actionItem)}>
              <ShareVerseButton verseKey={verse.verseKey} />
            </div>
            <div className={classNames(styles.actionItem)}>
              <QuranReflectButton verseKey={verse.verseKey} />
            </div>
            <div className={styles.actionItem}>
              <PlayVerseAudioButton
                verseKey={verse.verseKey}
                timestamp={verse.timestamps.timestampFrom}
              />
            </div>
            <div className={styles.actionItem}>
              <OverflowVerseActionsMenu verse={verse} isModal isPortalled />
            </div>
          </div>
        </div>

        <div className={classNames(styles.contentContainer)}>
          <div className={styles.arabicVerseContainer}>
            <VerseText words={getVerseWords(verse)} shouldShowH1ForSEO={verseIndex === 0} />
          </div>
          <div className={styles.verseTranslationsContainer}>
            {verse.translations?.map((translation: Translation) => (
              <div key={translation.id} className={styles.verseTranslationContainer}>
                <TranslationText
                  translationFontScale={quranReaderStyles.translationFontScale}
                  text={translation.text}
                  languageId={translation.languageId}
                  resourceName={verse.translations?.length > 1 ? translation.resourceName : null}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <Separator />
    </div>
  );
};

/**
 * Since we are passing verse and it's an object
 * even if the same verse is passed, its reference will change
 * on fetching a new page and since Memo only does shallow comparison,
 * we need to use custom comparing logic:
 *
 *  1. Check if the verse id is the same.
 *  2. Check if the font changed.
 *  3. Check if number of translations are the same since on translation change, it should change.
 *
 * If the above condition is met, it's safe to assume that the result
 * of both renders are the same.
 *
 * @param {TranslationViewCellProps} prevProps
 * @param {TranslationViewCellProps} nextProps
 * @returns {boolean}
 */
const areVersesEqual = (
  prevProps: TranslationViewCellProps,
  nextProps: TranslationViewCellProps,
): boolean =>
  prevProps.verse.id === nextProps.verse.id &&
  !verseFontChanged(
    prevProps.quranReaderStyles,
    nextProps.quranReaderStyles,
    prevProps.verse.words,
    nextProps.verse.words,
  ) &&
  !verseTranslationChanged(prevProps.verse, nextProps.verse) &&
  !verseTranslationFontChanged(prevProps.quranReaderStyles, nextProps.quranReaderStyles);

export default memo(TranslationViewCell, areVersesEqual);
