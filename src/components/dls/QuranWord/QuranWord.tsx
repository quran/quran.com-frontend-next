import React, { ReactNode, useState, useMemo, useCallback } from 'react';

import classNames from 'classnames';
import { shallowEqual, useSelector } from 'react-redux';
import useSWRImmutable from 'swr/immutable';

import GlyphWord from './GlyphWord';
import onQuranWordClick from './onQuranWordClick';
import styles from './QuranWord.module.scss';
import TajweedWord from './TajweedWordImage';
import TextWord from './TextWord';

import { getChapterAudioData } from 'src/api';
import MobilePopover from 'src/components/dls/Popover/HoverablePopover';
import Wrapper from 'src/components/Wrapper/Wrapper';
import { selectReciter } from 'src/redux/slices/AudioPlayer/state';
import { selectIsWordHighlighted } from 'src/redux/slices/QuranReader/highlightedLocation';
import {
  selectWordClickFunctionality,
  selectReadingPreference,
  selectShowTooltipFor,
  selectWordByWordByWordPreferences,
} from 'src/redux/slices/QuranReader/readingPreferences';
import { makeChapterAudioDataUrl } from 'src/utils/apiPaths';
import { areArraysEqual } from 'src/utils/array';
import { isQCFFont } from 'src/utils/fontFaceHelper';
import { getChapterNumberFromKey, makeWordLocation } from 'src/utils/verse';
import {
  ReadingPreference,
  QuranFont,
  WordByWordType,
  WordClickFunctionality,
} from 'types/QuranReader';
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
  const wordClickFunctionality = useSelector(selectWordClickFunctionality);
  const reciter = useSelector(selectReciter, shallowEqual);
  const chapterId = word.verseKey ? getChapterNumberFromKey(word.verseKey) : null;
  const { data: audioData } = useSWRImmutable(
    chapterId ? makeChapterAudioDataUrl(reciter.id, chapterId, true) : null,
    () => getChapterAudioData(reciter.id, chapterId, true),
  );

  const [isTooltipOpened, setIsTooltipOpened] = useState(false);
  const { showWordByWordTranslation, showWordByWordTransliteration } = useSelector(
    selectWordByWordByWordPreferences,
    shallowEqual,
  );
  const readingPreference = useSelector(selectReadingPreference);
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
  } else if (font === QuranFont.Tajweed) {
    wordText = <TajweedWord path={word.text} alt={word.textUthmani} />;
  } else {
    wordText = (
      <TextWord font={font} text={word.text} charType={word.charType} cssClass={word.cssClass} />
    );
  }

  /*
    Only show the tooltip when the following conditions are met:

    1. When the current character is of type Word.
    2. When it's allowed to have word by word (won't be allowed for search results as of now).
    3. When the tooltip settings are set to either translation or transliteration or both.
  */
  const showTooltip =
    word.charType === CharType.Word && isWordByWordAllowed && !!showTooltipFor.length;

  const shouldBeHighLighted =
    isHighlighted || isTooltipOpened || (isAudioHighlightingAllowed && isAudioPlayingWord);

  const tooltipContent = useMemo(
    () => (isWordByWordAllowed ? getTooltipText(showTooltipFor, word) : null),
    [isWordByWordAllowed, showTooltipFor, word],
  );

  const onClick = useCallback(() => {
    if (wordClickFunctionality === WordClickFunctionality.PlayAudio && audioData)
      onQuranWordClick(word, audioData);
  }, [audioData, word, wordClickFunctionality]);
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
        [styles.additionalWordGap]: readingPreference === ReadingPreference.Translation,
        [styles.tajweedWord]: font === QuranFont.Tajweed,
      })}
    >
      <Wrapper
        shouldWrap={showTooltip}
        wrapper={(children) => (
          <MobilePopover
            defaultStyling={false}
            content={tooltipContent}
            onOpenChange={setIsTooltipOpened}
          >
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
