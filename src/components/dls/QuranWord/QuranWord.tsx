import React, { ReactNode, useState, useMemo } from 'react';

import classNames from 'classnames';
import { shallowEqual, useSelector } from 'react-redux';

import GlyphWord from './GlyphWord';
import styles from './QuranWord.module.scss';
import TextWord from './TextWord';

import { triggerPauseAudio, triggerPlayAudio } from 'src/components/AudioPlayer/EventTriggers';
import MobilePopover from 'src/components/dls/Popover/HoverablePopover';
import Wrapper from 'src/components/Wrapper/Wrapper';
import { selectIsWordHighlighted } from 'src/redux/slices/QuranReader/highlightedLocation';
import {
  selectShowTooltipFor,
  selectWordByWordByWordPreferences,
} from 'src/redux/slices/QuranReader/readingPreferences';
import { areArraysEqual } from 'src/utils/array';
import { getWordByWordAudioUrl } from 'src/utils/audio';
import { isQCFFont } from 'src/utils/fontFaceHelper';
import { getVerseAndChapterNumbersFromKey, makeWordLocation } from 'src/utils/verse';
import { QuranFont, WordByWordType } from 'types/QuranReader';
import Word, { CharType } from 'types/Word';

export const DATA_ATTRIBUTE_WORD_LOCATION = 'data-word-location';

export type QuranWordProps = {
  word: Word;
  font?: QuranFont;
  isHighlighted?: boolean;
  isWordByWordAllowed?: boolean;
  isAudioHighlightingAllowed?: boolean;
};

const getGlyph = (word: Word, font: QuranFont) => {
  if (font === QuranFont.MadaniV1) return word.codeV1;
  return word.codeV2;
};

const QuranWord = ({
  word,
  font,
  isWordByWordAllowed = true,
  isAudioHighlightingAllowed = true,
  isHighlighted,
}: QuranWordProps) => {
  const [isTooltipOpened, setIsTooltipOpened] = useState(false);
  const { showWordByWordTranslation, showWordByWordTransliteration } = useSelector(
    selectWordByWordByWordPreferences,
    shallowEqual,
  );
  const showTooltipFor = useSelector(selectShowTooltipFor, areArraysEqual);

  // creating wordLocation instead of using `word.location` because
  // the value of `word.location` is `1:3:5-7`, but we want `1:3:5`
  const wordLocation = makeWordLocation(word.verseKey, word.position);

  // Determine if the audio player is currently playing the word
  const isAudioPlayingWord = useSelector(selectIsWordHighlighted(wordLocation));

  const isWordByWordLayout = showWordByWordTranslation || showWordByWordTransliteration;
  let wordText = null;

  if (isQCFFont(font)) {
    wordText = <GlyphWord font={font} text={getGlyph(word, font)} pageNumber={word.pageNumber} />;
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

  const shouldBeHighLighted =
    isHighlighted || isTooltipOpened || (isAudioHighlightingAllowed && isAudioPlayingWord);

  const tooltipContent = useMemo(
    () => (isWordByWordAllowed ? getTooltipText(showTooltipFor, word) : null),
    [isWordByWordAllowed, showTooltipFor, word],
  );

  const onClick = () => {
    const [chapter, verse] = getVerseAndChapterNumbersFromKey(word.verseKey);
    const { position } = word;
    playWordByWordAudio(Number(chapter), Number(verse), position);
  };

  return (
    <div
      onClick={onClick}
      onKeyPress={onClick}
      role="button"
      tabIndex={0}
      {...{
        [DATA_ATTRIBUTE_WORD_LOCATION]: wordLocation,
      }}
      className={classNames(styles.container, {
        [styles.highlighted]: shouldBeHighLighted,
        [styles.wbwContainer]: isWordByWordLayout,
      })}
    >
      <Wrapper
        shouldWrap={showTooltip}
        wrapper={(children) => (
          <MobilePopover content={tooltipContent} onOpenChange={setIsTooltipOpened}>
            {children}
          </MobilePopover>
        )}
      >
        {wordText}
      </Wrapper>
      {isWordByWordAllowed && (
        <>
          {showWordByWordTransliteration && (
            <p className={styles.wbwText}>{word.transliteration?.text}</p>
          )}
          {showWordByWordTranslation && <p className={styles.wbwText}>{word.translation?.text}</p>}
        </>
      )}
    </div>
  );
};

/**
 * Generate the Tooltip content based on the settings.
 *
 * @param {WordByWordType[]} showTooltipFor
 * @param {Word} word
 * @returns {ReactNode}
 */
const getTooltipText = (showTooltipFor: WordByWordType[], word: Word): ReactNode => (
  <>
    {showTooltipFor.map((tooltipTextType) => (
      <p key={tooltipTextType} className={styles.tooltipText}>
        {word[tooltipTextType].text}
      </p>
    ))}
  </>
);

export default QuranWord;

/**
 * Given chapter, verse and word location
 * 1) stop the word by word audio player if it's currently playing
 * 2) pause the main audio player if it's currently playing
 * 3) play the word by word audio
 * 4) resume the main audio player it it's previously was playing
 *
 * Terms
 * - main audio player refer to the audio player in the bottom navbar, this audio player plays the entire chapter
 * - word by word audio player refer to the audio player that play the clicked word
 *
 *
 * @param {number} chapter
 * @param {number} verse
 * @param {number} location
 */
const playWordByWordAudio = (chapter: number, verse: number, location: number) => {
  // stop the audio and remove the DOM if it exists
  if (window.wordByWordAudioPlayerEl) {
    window.wordByWordAudioPlayerEl.pause();
    window.wordByWordAudioPlayerEl.remove();
    window.wordByWordAudioPlayerEl = null;
  }

  const isMainAudioPlayerPlaying = window.audioPlayerEl && !window.audioPlayerEl.paused;

  const removeDOMAndResumeMainAudioPlayer = () => {
    window.wordByWordAudioPlayerEl.removeEventListener('ended', removeDOMAndResumeMainAudioPlayer);
    window.wordByWordAudioPlayerEl.remove();

    if (isMainAudioPlayerPlaying) triggerPlayAudio();
  };

  const url = getWordByWordAudioUrl(chapter, verse, location);
  window.wordByWordAudioPlayerEl = new Audio(url);
  if (isMainAudioPlayerPlaying) triggerPauseAudio();

  window.wordByWordAudioPlayerEl.play();
  window.wordByWordAudioPlayerEl.addEventListener('ended', removeDOMAndResumeMainAudioPlayer);
};
