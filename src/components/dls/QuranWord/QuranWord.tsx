/* eslint-disable max-lines */
import React, { memo, useCallback, useContext, useMemo, useState } from 'react';

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
import useIsMobile from '@/hooks/useIsMobile';
import ArrowIcon from '@/public/icons/arrow.svg';
import { selectShowTooltipWhenPlayingAudio } from '@/redux/slices/AudioPlayer/state';
import {
  selectInlineDisplayWordByWordPreferences,
  selectReadingPreference,
  selectTooltipContentType,
  selectWordClickFunctionality,
} from '@/redux/slices/QuranReader/readingPreferences';
import { setReadingViewHoveredVerseKey } from '@/redux/slices/QuranReader/readingViewVerse';
import { openStudyMode } from '@/redux/slices/QuranReader/studyMode';
import {
  MushafLines,
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
import Word, { CharType } from 'types/Word';

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
  isStartingVerseHighlighted?: boolean;
  isWordByWordAllowed?: boolean;
  isAudioHighlightingAllowed?: boolean;
  isFontLoaded?: boolean;
  tooltipType?: TooltipType;
  isWordInteractionDisabled?: boolean;
  shouldForceShowTooltip?: boolean;
  quranTextFontScaleOverride?: number;
  mushafLinesOverride?: MushafLines;
  shouldShowWordByWordTranslation?: boolean;
  shouldShowWordByWordTransliteration?: boolean;
  isStandaloneMode?: boolean;
};

const QuranWord = ({
  word,
  font,
  isWordByWordAllowed = true,
  isAudioHighlightingAllowed = true,
  isHighlighted,
  isStartingVerseHighlighted = false,
  isFontLoaded = true,
  tooltipType,
  isWordInteractionDisabled = false,
  shouldForceShowTooltip = false,
  // Standalone mode (widget/embed) doesn't use redux, so we can override these styles via props
  quranTextFontScaleOverride,
  mushafLinesOverride,
  shouldShowWordByWordTranslation,
  shouldShowWordByWordTransliteration,
  isStandaloneMode = false,
}: QuranWordProps) => {
  const dispatch = useDispatch();
  const { t } = useTranslation('quran-reader');
  const isMobile = useIsMobile();
  const wordClickFunctionality = useSelector(selectWordClickFunctionality);
  const audioService = useContext(AudioPlayerMachineContext);

  const showTooltipWhenPlayingAudio = useSelector(selectShowTooltipWhenPlayingAudio);

  const [isTooltipOpened, setIsTooltipOpened] = useState(false);

  const reduxWbwPrefs = useSelector(selectInlineDisplayWordByWordPreferences, shallowEqual);
  const showWordByWordTranslation =
    shouldShowWordByWordTranslation ?? reduxWbwPrefs.showWordByWordTranslation;
  const showWordByWordTransliteration =
    shouldShowWordByWordTransliteration ?? reduxWbwPrefs.showWordByWordTransliteration;
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
        quranTextFontScaleOverride={quranTextFontScaleOverride}
        mushafLinesOverride={mushafLinesOverride}
      />
    );
  } else if (word.charTypeName !== CharType.Pause) {
    wordText = <TextWord font={font} text={word.text} charType={word.charTypeName} />;
  }

  /*
    Only show the tooltip when the following conditions are met:

    1. When the current character is of type Word.
    2. When it's allowed to have word by word (won't be allowed for search results as of now).
    3. When the tooltip settings are set to either translation or transliteration or both.
       This applies to both reading and translation modes.
    4. When it's not in standalone mode (e.g. widget/embed)
  */
  const showTooltip =
    word.charTypeName === CharType.Word &&
    isWordByWordAllowed &&
    !!showTooltipFor.length &&
    !isStandaloneMode;

  const translationViewTooltipContent = useMemo(
    () => (isWordByWordAllowed ? getTooltipText(showTooltipFor, word) : null),
    [isWordByWordAllowed, showTooltipFor, word],
  );

  const getReadingModeSuffix = useCallback(() => {
    if (readingPreference === ReadingPreference.Translation) {
      return 'verse_by_verse';
    }
    return 'arabic_reading';
  }, [readingPreference]);

  const seekToWordIfPlaying = useCallback(() => {
    const currentState = audioService.getSnapshot();
    const isPlaying = currentState.matches('VISIBLE.AUDIO_PLAYER_INITIATED.PLAYING');
    const currentSurah = getChapterNumberFromKey(word.verseKey);
    const isSameSurah = currentState.context.surah === Number(currentSurah);

    if (isPlaying && isSameSurah) {
      const wordSegment = getWordTimeSegment(currentState.context.audioData.verseTimings, word);
      if (wordSegment) {
        const [startTime] = wordSegment;
        audioService.send({ type: 'SEEK_TO', timestamp: milliSecondsToSeconds(startTime) });
        logButtonClick('quran_word_pronounce');
        return true;
      }
    }
    return false;
  }, [audioService, word]);

  const handleWordAction = useCallback(() => {
    if (isRecitationEnabled) {
      const didSeek = seekToWordIfPlaying();
      if (!didSeek) {
        logButtonClick('quran_word_pronounce');
        playWordAudio(word);
      }
    } else {
      logButtonClick('quran_word');
    }
  }, [isRecitationEnabled, seekToWordIfPlaying, word]);

  const handleInteraction = useCallback(() => {
    const modeSuffix = getReadingModeSuffix();

    if (word.charTypeName === CharType.Word && !isRecitationEnabled) {
      seekToWordIfPlaying();
    }

    if (word.charTypeName === CharType.End) {
      logButtonClick(`study_mode_open_ayah_number_${modeSuffix}`, { verseKey: word.verseKey });
      dispatch(setReadingViewHoveredVerseKey(null));
      dispatch(openStudyMode({ verseKey: word.verseKey }));
      return;
    }

    if (isMobile && !isRecitationEnabled && word.charTypeName === CharType.Word && showTooltip) {
      return;
    }

    if (!isRecitationEnabled && word.charTypeName === CharType.Word) {
      logButtonClick(`study_mode_open_word_${modeSuffix}`, { verseKey: word.verseKey });
      dispatch(setReadingViewHoveredVerseKey(null));
      dispatch(openStudyMode({ verseKey: word.verseKey, highlightedWordLocation: word.location }));
      return;
    }

    if (isRecitationEnabled && word.charTypeName === CharType.Word && !showTooltip) {
      handleWordAction();
      logButtonClick(`study_mode_open_word_${modeSuffix}`, { verseKey: word.verseKey });
      dispatch(setReadingViewHoveredVerseKey(null));
      dispatch(openStudyMode({ verseKey: word.verseKey, highlightedWordLocation: word.location }));
      return;
    }

    handleWordAction();
  }, [
    word,
    isRecitationEnabled,
    isMobile,
    showTooltip,
    handleWordAction,
    dispatch,
    getReadingModeSuffix,
    seekToWordIfPlaying,
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

  const isInteractionDisabled = isStandaloneMode || isWordInteractionDisabled;
  // Allow clicking on words and ayah numbers in both reading and translation mode for study mode modal
  const shouldHandleWordClicking = !isInteractionDisabled;
  return (
    <div
      {...(shouldHandleWordClicking && { onClick, onKeyPress, role: 'button', tabIndex: 0 })}
      {...(!isInteractionDisabled && { onMouseEnter, onMouseLeave })}
      {...{
        [DATA_ATTRIBUTE_WORD_LOCATION]: wordLocation,
      }}
      className={classNames(styles.container, {
        [styles.interactionDisabled]: isWordInteractionDisabled,
        [styles.highlightOnHover]:
          !isWordInteractionDisabled && (isRecitationEnabled || !showTooltip),

        /**
         * If the font is Tajweed V4, color: xyz syntax does not work
         * since the COLOR glyph is a separate vector graphic made with
         * set of member glyphs of different colors. They all together
         * sit on top of the normal glyph and in browsers the render engine
         * does not deactivate the color layer of glyph that is sitting on
         * top of the normal/black glyph.
         */
        [styles.highlighted]: shouldBeHighLighted && font !== QuranFont.TajweedV4,
        [styles.startingVerseHighlighted]: isStartingVerseHighlighted,
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
            showTooltip && (shouldForceShowTooltip || !isInteractionDisabled);

          if (shouldShowWordTooltip) {
            const isTooltipOpen =
              shouldForceShowTooltip || (isAudioPlayingWord && showTooltipWhenPlayingAudio);

            const handleOpenStudyMode = () => {
              const modeSuffix = getReadingModeSuffix();
              logButtonClick(`study_mode_open_wbw_popover_${modeSuffix}`, {
                verseKey: word.verseKey,
              });
              dispatch(setReadingViewHoveredVerseKey(null));
              dispatch(
                openStudyMode({ verseKey: word.verseKey, highlightedWordLocation: word.location }),
              );
            };

            return (
              <MobilePopover
                icon={<ArrowIcon />}
                isOpen={isTooltipOpen ? true : undefined}
                defaultStyling={false}
                content={translationViewTooltipContent}
                onOpenChange={setIsTooltipOpened}
                tooltipType={tooltipType || TooltipType.SUCCESS}
                shouldContentBeClickable
                onIconClick={handleOpenStudyMode}
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
    </div>
  );
};

export default memo(QuranWord);
