/* eslint-disable max-lines */
import React, { memo, useCallback, useContext, useRef } from 'react';

import { useSelector as useSelectorXstate } from '@xstate/react';
import classNames from 'classnames';
import { useSelector } from 'react-redux';

import { QURAN_READER_OBSERVER_ID } from '../observer';
import {
  verseFontChanged,
  verseTranslationChanged,
  verseTranslationFontChanged,
} from '../utils/memoization';

import BottomActions from './BottomActions';
import TopActions from './TopActions';
import TranslationText from './TranslationText';
import styles from './TranslationViewCell.module.scss';

import { useOnboarding } from '@/components/Onboarding/OnboardingProvider';
import VerseText from '@/components/Verse/VerseText';
import Separator from '@/dls/Separator/Separator';
import useNavbarAutoHide from '@/hooks/useNavbarAutoHide';
import useIntersectionObserver from '@/hooks/useObserveElement';
import useScrollWithContextMenuOffset from '@/hooks/useScrollWithContextMenuOffset';
import { selectEnableAutoScrolling } from '@/redux/slices/AudioPlayer/state';
import QuranReaderStyles from '@/redux/types/QuranReaderStyles';
import { getVerseWords, makeVerseKey } from '@/utils/verse';
import { selectIsAudioPlayerVisible } from 'src/xstate/actors/audioPlayer/selectors';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';
import Translation from 'types/Translation';
import Verse from 'types/Verse';

type TranslationViewCellProps = {
  verse: Verse;
  quranReaderStyles: QuranReaderStyles;
  verseIndex: number;
  bookmarksRangeUrl?: string | null; // optional to allow SSR fallback without auth
  hasNotes?: boolean;
  hasQuestions?: boolean;
};

const TranslationViewCell: React.FC<TranslationViewCellProps> = ({
  verse,
  quranReaderStyles,
  verseIndex,
  bookmarksRangeUrl,
  hasNotes,
  hasQuestions,
}) => {
  const audioService = useContext(AudioPlayerMachineContext);
  const isHighlighted = useSelectorXstate(audioService, (state) => {
    // Don't highlight when audio player is closed
    if (!selectIsAudioPlayerVisible(state)) return false;

    const { ayahNumber, surah } = state.context;
    return makeVerseKey(surah, ayahNumber) === verse.verseKey;
  });

  const { isActive } = useOnboarding();
  // disable auto scrolling when the user is onboarding
  const enableAutoScrolling = useSelector(selectEnableAutoScrolling) && !isActive;

  // Use our custom hook that handles scrolling with context menu offset
  const [scrollToSelectedItem, selectedItemRef] = useScrollWithContextMenuOffset<HTMLDivElement>();

  const shouldTrigger = isHighlighted && enableAutoScrolling;
  useNavbarAutoHide(shouldTrigger, scrollToSelectedItem, [
    enableAutoScrolling,
    isHighlighted,
    scrollToSelectedItem,
  ]);

  // Register this cell with the global intersection observer for page tracking
  const observerRef = useRef<HTMLDivElement | null>(null);
  useIntersectionObserver(observerRef, QURAN_READER_OBSERVER_ID);

  // Callback ref to merge both selectedItemRef and observerRef
  const mergedRef = useCallback(
    (node: HTMLDivElement | null) => {
      // Update both refs
      if (selectedItemRef) {
        (selectedItemRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }
      observerRef.current = node;
    },
    [selectedItemRef],
  );

  return (
    <>
      <div
        ref={mergedRef}
        data-verse-key={verse.verseKey}
        data-page={verse.pageNumber}
        data-chapter-id={verse.chapterId}
        data-hizb={verse.hizbNumber}
        data-testid={`verse-${verse.verseKey}`}
        className={classNames(styles.cellContainer, {
          [styles.highlightedContainer]: isHighlighted,
        })}
      >
        <TopActions verse={verse} bookmarksRangeUrl={bookmarksRangeUrl} hasNotes={hasNotes} />

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
        <BottomActions verseKey={verse.verseKey} hasQuestions={hasQuestions} />
      </div>
      <Separator className={styles.verseSeparator} />
    </>
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
  prevProps.hasQuestions === nextProps.hasQuestions &&
  !verseFontChanged(
    prevProps.quranReaderStyles,
    nextProps.quranReaderStyles,
    prevProps.verse.words,
    nextProps.verse.words,
  ) &&
  !verseTranslationChanged(prevProps.verse, nextProps.verse) &&
  !verseTranslationFontChanged(prevProps.quranReaderStyles, nextProps.quranReaderStyles) &&
  prevProps.bookmarksRangeUrl === nextProps.bookmarksRangeUrl;
export default memo(TranslationViewCell, areVersesEqual);
