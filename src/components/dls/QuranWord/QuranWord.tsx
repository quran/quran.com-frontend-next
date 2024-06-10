/* eslint-disable max-lines */
import React, { useState, useMemo, useCallback, memo, useContext } from 'react';

import { useSelector as useXstateSelector } from '@xstate/react';
import classNames from 'classnames';
import { shallowEqual, useSelector } from 'react-redux';

import InlineWordByWord from '../InlineWordByWord';

import getTooltipText from './getToolTipText';
import GlyphWord from './GlyphWord';
import playWordAudio from './playWordAudio';
import styles from './QuranWord.module.scss';
import TextWord from './TextWord';

import ReadingViewWordPopover from '@/components/QuranReader/ReadingView/WordPopover';
import Wrapper from '@/components/Wrapper/Wrapper';
import MobilePopover from '@/dls/Popover/HoverablePopover';
import { selectShowTooltipWhenPlayingAudio } from '@/redux/slices/AudioPlayer/state';
import {
  selectWordClickFunctionality,
  selectReadingPreference,
  selectTooltipContentType,
  selectInlineDisplayWordByWordPreferences,
} from '@/redux/slices/QuranReader/readingPreferences';
import { areArraysEqual } from '@/utils/array';
import { milliSecondsToSeconds } from '@/utils/datetime';
import { logButtonClick } from '@/utils/eventLogger';
import { isQCFFont } from '@/utils/fontFaceHelper';
import { getChapterNumberFromKey, makeWordLocation } from '@/utils/verse';
import { getWordTimeSegment } from 'src/xstate/actors/audioPlayer/audioPlayerMachineHelper';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';
import { ReadingPreference, QuranFont, WordClickFunctionality } from 'types/QuranReader';
import Word, { CharType } from 'types/Word';

export const DATA_ATTRIBUTE_WORD_LOCATION = 'data-word-location';

export type QuranWordProps = {
  word: Word;
  font?: QuranFont;
  isHighlighted?: boolean;
  isWordByWordAllowed?: boolean;
  isAudioHighlightingAllowed?: boolean;
  isFontLoaded?: boolean;
  shouldShowSecondaryHighlight?: boolean;
};

const QuranWord = ({
  word,
  font,
  isWordByWordAllowed = true,
  isAudioHighlightingAllowed = true,
  isHighlighted,
  shouldShowSecondaryHighlight = false,
  isFontLoaded = true,
}: QuranWordProps) => {
  const wordClickFunctionality = useSelector(selectWordClickFunctionality);
  const audioService = useContext(AudioPlayerMachineContext);

  const showTooltipWhenPlayingAudio = useSelector(selectShowTooltipWhenPlayingAudio);

  const [isTooltipOpened, setIsTooltipOpened] = useState(false);
  const { showWordByWordTranslation, showWordByWordTransliteration } = useSelector(
    selectInlineDisplayWordByWordPreferences,
    shallowEqual,
  );
  const readingPreference = useSelector(selectReadingPreference);
  const showTooltipFor = useSelector(selectTooltipContentType, areArraysEqual);

  // creating wordLocation instead of using `word.location` because
  // the value of `word.location` is `1:3:5-7`, but we want `1:3:5`
  const wordLocation = makeWordLocation(word.verseKey, word.position);

  // Determine if the audio player is currently playing the word
  const isAudioPlayingWord = useXstateSelector(audioService, (state) => {
    const { surah, ayahNumber, wordLocation: wordPosition } = state.context;
    return `${surah}:${ayahNumber}:${wordPosition}` === wordLocation;
  });

  const isWordByWordLayout = showWordByWordTranslation || showWordByWordTransliteration;
  let wordText = null;
  const shouldBeHighLighted =
    isHighlighted || isTooltipOpened || (isAudioHighlightingAllowed && isAudioPlayingWord);

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
    3. When the tooltip settings are set to either translation or transliteration or both.
  */
  const showTooltip =
    word.charTypeName === CharType.Word && isWordByWordAllowed && !!showTooltipFor.length;
  const translationViewTooltipContent = useMemo(
    () => (isWordByWordAllowed ? getTooltipText(showTooltipFor, word) : null),
    [isWordByWordAllowed, showTooltipFor, word],
  );
  const isRecitationEnabled = wordClickFunctionality === WordClickFunctionality.PlayAudio;

  const onClick = useCallback(() => {
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

  const shouldHandleWordClicking =
    readingPreference === ReadingPreference.Translation && word.charTypeName !== CharType.End;

  return (
    <div
      {...(shouldHandleWordClicking && { onClick, onKeyPress: onClick })}
      role="button"
      tabIndex={0}
      {...{
        [DATA_ATTRIBUTE_WORD_LOCATION]: wordLocation,
      }}
      className={classNames(styles.container, {
        [styles.highlightOnHover]: isRecitationEnabled,
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
        [styles.additionalWordGap]: readingPreference === ReadingPreference.Translation,
      })}
    >
      <Wrapper
        shouldWrap={showTooltip}
        wrapper={(children) =>
          readingPreference === ReadingPreference.Translation ? (
            <MobilePopover
              isOpen={isAudioPlayingWord && showTooltipWhenPlayingAudio ? true : undefined}
              defaultStyling={false}
              content={translationViewTooltipContent}
              onOpenChange={setIsTooltipOpened}
            >
              {children}
            </MobilePopover>
          ) : (
            <ReadingViewWordPopover word={word}>{children}</ReadingViewWordPopover>
          )
        }
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
