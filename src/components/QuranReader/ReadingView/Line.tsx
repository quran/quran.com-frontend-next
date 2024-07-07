import React, { useEffect, memo, useContext, RefObject } from 'react';

import { useSelector as useXstateSelector } from '@xstate/react';
import classNames from 'classnames';
import { shallowEqual, useSelector } from 'react-redux';

import { verseFontChanged } from '../utils/memoization';

import styles from './Line.module.scss';

import ChapterHeader from '@/components/chapters/ChapterHeader';
import { useOnboarding } from '@/components/Onboarding/OnboardingProvider';
import VerseText from '@/components/Verse/VerseText';
import useScroll, { SMOOTH_SCROLL_TO_CENTER } from '@/hooks/useScrollToElement';
import { selectEnableAutoScrolling } from '@/redux/slices/AudioPlayer/state';
import { selectInlineDisplayWordByWordPreferences } from '@/redux/slices/QuranReader/readingPreferences';
import QuranReaderStyles from '@/redux/types/QuranReaderStyles';
import { getWordDataByLocation } from '@/utils/verse';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';
import Word from 'types/Word';

export type LineProps = {
  words: Word[];
  lineKey: string;
  isBigTextLayout: boolean;
  // eslint-disable-next-line react/no-unused-prop-types
  quranReaderStyles: QuranReaderStyles;
  pageIndex: number;
  lineIndex: number;
};

const Line = ({ lineKey, words, isBigTextLayout, pageIndex, lineIndex }: LineProps) => {
  const audioService = useContext(AudioPlayerMachineContext);
  const isHighlighted = useXstateSelector(audioService, (state) => {
    const { surah, ayahNumber } = state.context;
    const verseKeys = words.map((word) => word.verseKey);
    return verseKeys.includes(`${surah}:${ayahNumber}`);
  });

  const [scrollToSelectedItem, selectedItemRef]: [() => void, RefObject<HTMLDivElement>] =
    useScroll(SMOOTH_SCROLL_TO_CENTER);

  const { isActive } = useOnboarding();
  // disable auto scrolling when the user is onboarding
  const enableAutoScrolling = useSelector(selectEnableAutoScrolling, shallowEqual) && !isActive;
  const { showWordByWordTranslation, showWordByWordTransliteration } = useSelector(
    selectInlineDisplayWordByWordPreferences,
    shallowEqual,
  );

  useEffect(() => {
    if (isHighlighted && enableAutoScrolling) {
      scrollToSelectedItem();
    }
  }, [isHighlighted, scrollToSelectedItem, enableAutoScrolling]);

  const firstWordData = getWordDataByLocation(words[0].location);
  const shouldShowChapterHeader = firstWordData[1] === '1' && firstWordData[2] === '1';
  const isWordByWordLayout = showWordByWordTranslation || showWordByWordTransliteration;

  return (
    <div
      ref={selectedItemRef}
      id={lineKey}
      className={classNames(styles.container, {
        [styles.highlighted]: isHighlighted,
        [styles.mobileInline]: isBigTextLayout,
      })}
    >
      {shouldShowChapterHeader && (
        <ChapterHeader
          chapterId={firstWordData[0]}
          pageNumber={words[0].pageNumber}
          hizbNumber={words[0].hizbNumber}
        />
      )}
      <div
        className={classNames(styles.line, {
          [styles.mobileInline]: isBigTextLayout,
          [styles.fixedWidth]: !isWordByWordLayout,
        })}
      >
        <VerseText
          words={words}
          isReadingMode
          isHighlighted={isHighlighted}
          shouldShowH1ForSEO={pageIndex === 0 && lineIndex === 0}
        />
      </div>
    </div>
  );
};

/**
 * Since we are passing words and it's an array
 * even if the same words are passed, their reference will change
 * on fetching a new page and since Memo only does shallow comparison,
 * we need to use custom comparing logic:
 *
 *  1. Check if the line keys are the same.
 *  2. Check if the number of words are the same.
 *  3. Check if isBigTextLayout values are the same.
 *  4. Check if the font changed.
 *
 * If the above conditions are met, it's safe to assume that the result
 * of both renders are the same.
 *
 * @param {LineProps} prevProps
 * @param {LineProps} nextProps
 * @returns {boolean}
 */
const areLinesEqual = (prevProps: LineProps, nextProps: LineProps): boolean =>
  prevProps.lineKey === nextProps.lineKey &&
  prevProps.isBigTextLayout === nextProps.isBigTextLayout &&
  !verseFontChanged(
    prevProps.quranReaderStyles,
    nextProps.quranReaderStyles,
    prevProps.words,
    nextProps.words,
  );

export default memo(Line, areLinesEqual);
