/* eslint-disable max-lines */
import React, { memo, useCallback, useContext, useMemo, useState, lazy, Suspense } from 'react';

import { useSelector as useXstateSelector } from '@xstate/react';
import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useSelector, useDispatch } from 'react-redux';

import InlineWordByWord from '../InlineWordByWord';
import { TooltipType } from '../Tooltip';

import getTooltipText from './getToolTipText';
import GlyphWord from './GlyphWord';
import playWordAudio from './playWordAudio';
import styles from './QuranWord.module.scss';
import TextWord from './TextWord';

import Wrapper from '@/components/Wrapper/Wrapper';
import MobilePopover from '@/dls/Popover/HoverablePopover';
import ArrowIcon from '@/public/icons/arrow.svg';
import { selectShowTooltipWhenPlayingAudio } from '@/redux/slices/AudioPlayer/state';
import {
  selectInlineDisplayWordByWordPreferences,
  selectReadingPreference,
  selectTooltipContentType,
  selectWordClickFunctionality,
} from '@/redux/slices/QuranReader/readingPreferences';
import { setReadingViewHoveredVerseKey } from '@/redux/slices/QuranReader/readingViewVerse';
import {
  QuranFont,
  ReadingPreference,
  WordByWordType,
  WordClickFunctionality,
} from '@/types/QuranReader';
import { areArraysEqual } from '@/utils/array';
import { milliSecondsToSeconds } from '@/utils/datetime';
import { logButtonClick } from '@/utils/eventLogger';
import { isQCFFont } from '@/utils/fontFaceHelper';
import { getChapterNumberFromKey, makeWordLocation } from '@/utils/verse';
import { getWordTimeSegment } from 'src/xstate/actors/audioPlayer/audioPlayerMachineHelper';
import { selectIsAudioPlayerVisible } from 'src/xstate/actors/audioPlayer/selectors';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';
import Verse from 'types/Verse';
import Word, { CharType } from 'types/Word';

const StudyModeModal = lazy(() => import('@/components/QuranReader/ReadingView/StudyModeModal'));

export const DATA_ATTRIBUTE_WORD_LOCATION = 'data-word-location';

// IndoPak stop sign characters that require additional spacing
const INDO_PAK_STOP_SIGN_CHARS = new Set([
  '\u06D6', // Arabic small high meem (ۖ)
  '\u06D7', // Arabic small high qaf (ۗ)
  '\u06D8', // Arabic small high noon (ۘ)
  '\u06D9', // Arabic small high meem (ۙ)
  '\u06DA', // Arabic small high lam alef (ۚ)
  '\u06DB', // Arabic small high jeem (ۛ)
  '\u06DC', // Arabic small high seen (ۜ)
  '\u06E2', // Arabic small high madda (ۢ)
  '\u0615', // Arabic small high tah (ؕ)
  '\u06EA', // Arabic empty centre high stop (۪)
  '\u06EB', // Arabic empty centre low stop (۫)
  '\u0617', // Arabic inverted damma (ُ)
  '\u06E5', // Arabic small waw (ۥ)
]);

export type QuranWordProps = {
  word: Word;
  font?: QuranFont;
  isHighlighted?: boolean;
  isWordByWordAllowed?: boolean;
  isAudioHighlightingAllowed?: boolean;
  isFontLoaded?: boolean;
  shouldShowSecondaryHighlight?: boolean;
  bookmarksRangeUrl?: string | null;
  tooltipType?: TooltipType;
  isWordInteractionDisabled?: boolean;
  shouldForceShowTooltip?: boolean;
  verse?: Verse;
};

const QuranWord = ({
  word,
  font,
  isWordByWordAllowed = true,
  isAudioHighlightingAllowed = true,
  isHighlighted,
  shouldShowSecondaryHighlight = false,
  isFontLoaded = true,
  bookmarksRangeUrl,
  tooltipType,
  isWordInteractionDisabled = false,
  shouldForceShowTooltip = false,
  verse,
}: QuranWordProps) => {
  const dispatch = useDispatch();
  const { t } = useTranslation('common');
  const wordClickFunctionality = useSelector(selectWordClickFunctionality);
  const audioService = useContext(AudioPlayerMachineContext);

  const showTooltipWhenPlayingAudio = useSelector(selectShowTooltipWhenPlayingAudio);

  const [isTooltipOpened, setIsTooltipOpened] = useState(false);
  const [isStudyModeModalOpen, setIsStudyModeModalOpen] = useState(false);
  const [highlightedWordLocation, setHighlightedWordLocation] = useState<string | undefined>(
    undefined,
  );

  const { showWordByWordTranslation, showWordByWordTransliteration } = useSelector(
    selectInlineDisplayWordByWordPreferences,
    shallowEqual,
  );
  const readingPreference = useSelector(selectReadingPreference);
  const showTooltipFor = useSelector(selectTooltipContentType, areArraysEqual) as WordByWordType[];

  const isTranslationMode = readingPreference === ReadingPreference.Translation;
  const isRecitationEnabled = wordClickFunctionality === WordClickFunctionality.PlayAudio;

  // creating wordLocation instead of using `word.location` because
  // the value of `word.location` is `1:3:5-7`, but we want `1:3:5`
  const wordLocation = makeWordLocation(word.verseKey, word.position);

  // Determine if the audio player is currently playing the word
  const isAudioPlayingWord = useXstateSelector(audioService, (state) => {
    // Don't highlight when audio player is closed
    if (!selectIsAudioPlayerVisible(state)) return false;

    const { surah, ayahNumber, wordLocation: wordPosition } = state.context;
    return `${surah}:${ayahNumber}:${wordPosition}` === wordLocation;
  });

  const isWordByWordLayout = showWordByWordTranslation || showWordByWordTransliteration;
  let wordText = null;
  const shouldBeHighLighted =
    isHighlighted || isTooltipOpened || (isAudioHighlightingAllowed && isAudioPlayingWord);

  // Check if the current word has IndoPak stop signs
  const isIndoPakFont = font === QuranFont.IndoPak;
  const hasIndoPakStopSign = useMemo(
    () =>
      isIndoPakFont &&
      word.text &&
      Array.from(word.text).some((char) => INDO_PAK_STOP_SIGN_CHARS.has(char)),
    [isIndoPakFont, word.text],
  );

  if (isQCFFont(font)) {
    wordText = (
      <GlyphWord
        font={font}
        qpcUthmaniHafs={word.qpcUthmaniHafs}
        pageNumber={word.pageNumber}
        textCodeV1={word.codeV1}
        textCodeV2={word.codeV2}
        isFontLoaded={isFontLoaded}
        isHighlighted={shouldBeHighLighted}
        charType={word.charTypeName}
      />
    );
  } else if (word.charTypeName !== CharType.Pause) {
    wordText = <TextWord font={font} text={word.text} charType={word.charTypeName} />;
  }

  /*
    Only show the tooltip when the following conditions are met:

    1. When the current character is of type Word.
    2. When it's allowed to have word by word (won't be allowed for search results as of now).
    3. When in translation view: the tooltip settings are set to either translation or transliteration or both.
       When in reading view: always show tooltip.
  */
  const showTooltip =
    word.charTypeName === CharType.Word &&
    isWordByWordAllowed &&
    (isTranslationMode ? !!showTooltipFor.length : true);
  const translationViewTooltipContent = useMemo(
    () => (isWordByWordAllowed ? getTooltipText(showTooltipFor, word) : null),
    [isWordByWordAllowed, showTooltipFor, word],
  );

  const handleWordAction = useCallback(() => {
    if (isRecitationEnabled) {
      logButtonClick('quran_word_pronounce');
      const currentState = audioService.getSnapshot();
      const isPlaying = currentState.matches('VISIBLE.AUDIO_PLAYER_INITIATED.PLAYING');
      const currentSurah = getChapterNumberFromKey(word.verseKey);
      const isSameSurah = currentState.context.surah === Number(currentSurah);
      const shouldSeekTo = isPlaying && isSameSurah;
      if (shouldSeekTo) {
        const wordSegment = getWordTimeSegment(currentState.context.audioData.verseTimings, word);
        if (!wordSegment) return;
        const [startTime] = wordSegment;
        audioService.send({ type: 'SEEK_TO', timestamp: milliSecondsToSeconds(startTime) });
      } else {
        playWordAudio(word);
      }
    } else {
      logButtonClick('quran_word');
    }
  }, [audioService, isRecitationEnabled, word]);

  // Shared handler for both click and keyboard interactions
  const handleInteraction = useCallback(() => {
    // Open study mode modal when clicking ayah number (in both reading and translation mode)
    if (word.charTypeName === CharType.End) {
      dispatch(setReadingViewHoveredVerseKey(null));
      setHighlightedWordLocation(undefined);
      setIsStudyModeModalOpen(true);
      return;
    }

    // Open study mode modal when clicking a word (in both reading and translation mode)
    // This replaces the old behavior of opening popover/mobile modal in reading mode
    if (!isRecitationEnabled && word.charTypeName === CharType.Word) {
      dispatch(setReadingViewHoveredVerseKey(null));
      setHighlightedWordLocation(word.location);
      setIsStudyModeModalOpen(true);
      return;
    }

    handleWordAction();
  }, [
    word.charTypeName,
    word.location,
    isRecitationEnabled,
    handleWordAction,
    dispatch,
  ]);

  const onClick = useCallback(
    (e: React.MouseEvent) => {
      // Only handle clicks that are directly on word elements
      // This prevents word pronunciation when clicking on modal content in Reading mode
      if (e && e.target) {
        const target = e.target as Element;
        const wordElement = e.currentTarget as Element;

        // Ensure the click is on this word element or its children, not bubbled from elsewhere
        if (!wordElement.contains(target)) {
          return;
        }

        // Additional check: ensure we're clicking on the actual word content, not just the container
        const isClickingOnWordContent = wordElement?.getAttribute(DATA_ATTRIBUTE_WORD_LOCATION);
        if (!isClickingOnWordContent) {
          return;
        }
      }

      handleInteraction();
    },
    [handleInteraction],
  );

  const onKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault(); // Prevent scrolling on Space key
        handleInteraction();
      }
    },
    [handleInteraction],
  );

  const onMouseEnter = useCallback(() => {
    if (word.charTypeName === CharType.End) {
      dispatch(setReadingViewHoveredVerseKey(word.verseKey));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- dispatch is stable from useDispatch
  }, [word.charTypeName, word.verseKey]);

  const onMouseLeave = useCallback(() => {
    if (word.charTypeName === CharType.End) {
      dispatch(setReadingViewHoveredVerseKey(null));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- dispatch is stable from useDispatch
  }, [word.charTypeName]);

  // Allow clicking on words and ayah numbers in both reading and translation mode for study mode modal
  const shouldHandleWordClicking = !isWordInteractionDisabled;
  return (
    <div
      {...(shouldHandleWordClicking && { onClick, onKeyPress, role: 'button', tabIndex: 0 })}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      {...{
        [DATA_ATTRIBUTE_WORD_LOCATION]: wordLocation,
      }}
      className={classNames(styles.container, {
        [styles.interactionDisabled]: isWordInteractionDisabled,
        [styles.highlightOnHover]: !isWordInteractionDisabled && isRecitationEnabled,
        /**
         * If the font is Tajweed V4, color: xyz syntax does not work
         * since the COLOR glyph is a separate vector graphic made with
         * set of member glyphs of different colors. They all together
         * sit on top of the normal glyph and in browsers the render engine
         * does not deactivate the color layer of glyph that is sitting on
         * top of the normal/black glyph.
         */
        [styles.highlighted]: shouldBeHighLighted && font !== QuranFont.TajweedV4,
        [styles.secondaryHighlight]: shouldShowSecondaryHighlight,
        [styles.wbwContainer]: isWordByWordLayout,
        [styles.additionalWordGap]: isTranslationMode,
        [styles.additionalStopSignGap]: isTranslationMode && hasIndoPakStopSign,
      })}
    >
      <Wrapper
        shouldWrap
        wrapper={(children) => {
          // Show tooltip in both reading and translation modes
          const shouldShowWordTooltip =
            showTooltip && (shouldForceShowTooltip || !isWordInteractionDisabled);

          if (shouldShowWordTooltip) {
            const isTooltipOpen =
              shouldForceShowTooltip || (isAudioPlayingWord && showTooltipWhenPlayingAudio);
            return (
              <MobilePopover
                icon={<ArrowIcon />}
                isOpen={isTooltipOpen ? true : undefined}
                defaultStyling={false}
                content={translationViewTooltipContent}
                onOpenChange={setIsTooltipOpened}
                tooltipType={tooltipType || TooltipType.SUCCESS}
                shouldContentBeClickable
                onIconClick={() => {
                  dispatch(setReadingViewHoveredVerseKey(null));
                  setHighlightedWordLocation(word.location);
                  setIsStudyModeModalOpen(true);
                }}
                iconAriaLabel={t('aria.open-study-mode')}
              >
                {children}
              </MobilePopover>
            );
          }

          // All word clicks now open StudyModeModal directly via handleInteraction
          // No need for separate mobile/desktop wrappers
          return <>{children}</>;
        }}
      >
        {wordText}
      </Wrapper>
      {isWordByWordAllowed && (
        <>
          {showWordByWordTransliteration && <InlineWordByWord text={word.transliteration?.text} />}
          {showWordByWordTranslation && <InlineWordByWord text={word.translation?.text} />}
        </>
      )}

      <Suspense fallback={null}>
        <StudyModeModal
          isOpen={isStudyModeModalOpen}
          onClose={() => {
            setIsStudyModeModalOpen(false);
            setHighlightedWordLocation(undefined);
          }}
          word={word}
          verse={verse}
          highlightedWordLocation={highlightedWordLocation}
        />
      </Suspense>
    </div>
  );
};

export default memo(QuranWord);
