/* eslint-disable max-lines */
import React, { memo, useContext, useEffect } from 'react';

import { useSelector as useSelectorXstate } from '@xstate/react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';

import getTranslationsLabelString from '../ReadingView/utils/translation';
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
import useScrollWithContextMenuOffset from '@/hooks/useScrollWithContextMenuOffset';
import { selectEnableAutoScrolling } from '@/redux/slices/AudioPlayer/state';
import QuranReaderStyles from '@/redux/types/QuranReaderStyles';
import { WordVerse } from '@/types/Word';
import { constructWordVerse, getVerseWords, makeVerseKey } from '@/utils/verse';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';
import Translation from 'types/Translation';
import Verse from 'types/Verse';

type TranslationViewCellProps = {
  verse: Verse;
  quranReaderStyles: QuranReaderStyles;
  verseIndex: number;
  bookmarksRangeUrl?: string | null;
  hasNotes?: boolean;
};

const TranslationViewCell: React.FC<TranslationViewCellProps> = ({
  verse,
  quranReaderStyles,
  verseIndex,
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

  // Use our custom hook that handles scrolling with context menu offset
  const [scrollToSelectedItem, selectedItemRef] = useScrollWithContextMenuOffset<HTMLDivElement>();

  useEffect(() => {
    if ((isHighlighted && enableAutoScrolling) || Number(startingVerse) === verseIndex + 1) {
      scrollToSelectedItem();
    }
  }, [isHighlighted, scrollToSelectedItem, enableAutoScrolling, startingVerse, verseIndex]);

  const translationsLabel = getTranslationsLabelString(verse.translations);
  const translationsCount = verse.translations?.length || 0;
  const wordVerse: WordVerse = constructWordVerse(verse, translationsLabel, translationsCount);
  const verseWords = getVerseWords(verse);

  return (
    <div ref={selectedItemRef}>
      <div
        className={classNames(styles.cellContainer, {
          [styles.highlightedContainer]: isHighlighted,
        })}
        data-testid={`verse-${verse.verseKey}`}
      >
        <TopActions verse={wordVerse} bookmarksRangeUrl={bookmarksRangeUrl} hasNotes={hasNotes} />

        <div className={classNames(styles.contentContainer)}>
          <div className={styles.arabicVerseContainer}>
            <VerseText words={verseWords} shouldShowH1ForSEO={verseIndex === 0} />
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
        <BottomActions verseKey={verse.verseKey} />
      </div>
      <Separator className={styles.verseSeparator} />
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
  prevProps.bookmarksRangeUrl === nextProps.bookmarksRangeUrl &&
  prevProps.hasNotes === nextProps.hasNotes;
export default memo(TranslationViewCell, areVersesEqual);
