import React, { RefObject, memo, useContext, useEffect } from 'react';

import { useSelector as useSelectorXstate } from '@xstate/react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';

import {
  verseFontChanged,
  verseTranslationChanged,
  verseTranslationFontChanged,
} from '../utils/memoization';

import BookmarkIcon from './BookmarkIcon';
import TranslationText from './TranslationText';
import styles from './TranslationViewCell.module.scss';

import { useOnboarding } from '@/components/Onboarding/OnboardingProvider';
import QuranReflectButton from '@/components/QuranReader/QuranReflectButton';
import TafsirButton from '@/components/QuranReader/TafsirButton';
import VerseNotes from '@/components/Verse/Notes';
import OverflowVerseActionsMenu from '@/components/Verse/OverflowVerseActionsMenu';
import PlayVerseAudioButton from '@/components/Verse/PlayVerseAudioButton';
import VerseLink from '@/components/Verse/VerseLink';
import VerseText from '@/components/Verse/VerseText';
import Separator from '@/dls/Separator/Separator';
import useScroll, { SMOOTH_SCROLL_TO_TOP } from '@/hooks/useScrollToElement';
import { selectEnableAutoScrolling } from '@/redux/slices/AudioPlayer/state';
import QuranReaderStyles from '@/redux/types/QuranReaderStyles';
import { getVerseWords, makeVerseKey } from '@/utils/verse';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';
import BookmarksMap from 'types/BookmarksMap';
import Translation from 'types/Translation';
import Verse from 'types/Verse';

type TranslationViewCellProps = {
  verse: Verse;
  quranReaderStyles: QuranReaderStyles;
  verseIndex: number;
  pageBookmarks: BookmarksMap | undefined;
  bookmarksRangeUrl: string;
  hasNotes?: boolean;
};

const TranslationViewCell: React.FC<TranslationViewCellProps> = ({
  verse,
  quranReaderStyles,
  verseIndex,
  pageBookmarks,
  bookmarksRangeUrl,
  hasNotes,
}) => {
  const router = useRouter();
  const { startingVerse } = router.query;

  const audioService = useContext(AudioPlayerMachineContext);

  const isHighlighted = useSelectorXstate(audioService, (state) => {
    const { ayahNumber, surah } = state.context;
    return makeVerseKey(surah, ayahNumber) === verse.verseKey;
  });

  const { isActive } = useOnboarding();
  // disable auto scrolling when the user is onboarding
  const enableAutoScrolling = useSelector(selectEnableAutoScrolling) && !isActive;

  const [scrollToSelectedItem, selectedItemRef]: [() => void, RefObject<HTMLDivElement>] =
    useScroll(SMOOTH_SCROLL_TO_TOP);

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
              <BookmarkIcon
                verse={verse}
                pageBookmarks={pageBookmarks}
                bookmarksRangeUrl={bookmarksRangeUrl}
              />
            </div>
            <div className={styles.actionItem}>
              <VerseNotes verseKey={verse.verseKey} isTranslationView hasNotes={hasNotes} />
            </div>
            <div className={classNames(styles.actionItem, styles.priorityAction)}>
              <PlayVerseAudioButton verseKey={verse.verseKey} />
            </div>
            <div className={classNames(styles.actionItem)}>
              <TafsirButton verseKey={verse.verseKey} />
            </div>
            <div className={classNames(styles.actionItem)}>
              <QuranReflectButton verseKey={verse.verseKey} />
            </div>
          </div>
          <div className={styles.actionContainerRight}>
            <div className={styles.actionItem}>
              <OverflowVerseActionsMenu bookmarksRangeUrl={bookmarksRangeUrl} verse={verse} />
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
  prevProps.hasNotes === nextProps.hasNotes &&
  !verseFontChanged(
    prevProps.quranReaderStyles,
    nextProps.quranReaderStyles,
    prevProps.verse.words,
    nextProps.verse.words,
  ) &&
  !verseTranslationChanged(prevProps.verse, nextProps.verse) &&
  !verseTranslationFontChanged(prevProps.quranReaderStyles, nextProps.quranReaderStyles) &&
  JSON.stringify(prevProps.pageBookmarks) === JSON.stringify(nextProps.pageBookmarks) &&
  prevProps.bookmarksRangeUrl === nextProps.bookmarksRangeUrl;

export default memo(TranslationViewCell, areVersesEqual);
