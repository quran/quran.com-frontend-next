import React, { useState, useMemo, useCallback, memo } from 'react';

import classNames from 'classnames';
import { shallowEqual, useSelector } from 'react-redux';
import useSWRImmutable from 'swr/immutable';

import getTooltipText from './getToolTipText';
import GlyphWord from './GlyphWord';
import onQuranWordClick from './onQuranWordClick';
import styles from './QuranWord.module.scss';
import TajweedWord from './TajweedWordImage';
import TextWord from './TextWord';

import { getChapterAudioData } from 'src/api';
import MobilePopover from 'src/components/dls/Popover/HoverablePopover';
import ReadingViewWordPopover from 'src/components/QuranReader/ReadingView/WordPopover';
import Wrapper from 'src/components/Wrapper/Wrapper';
import useGetQueryParamOrReduxValue from 'src/hooks/useGetQueryParamOrReduxValue';
import { selectShowTooltipWhenPlayingAudio } from 'src/redux/slices/AudioPlayer/state';
import { selectIsWordHighlighted } from 'src/redux/slices/QuranReader/highlightedLocation';
import {
  selectWordClickFunctionality,
  selectReadingPreference,
  selectShowTooltipFor,
  selectWordByWordByWordPreferences,
} from 'src/redux/slices/QuranReader/readingPreferences';
import { makeChapterAudioDataUrl } from 'src/utils/apiPaths';
import { areArraysEqual } from 'src/utils/array';
import { logButtonClick } from 'src/utils/eventLogger';
import { isQCFFont } from 'src/utils/fontFaceHelper';
import { getChapterNumberFromKey, makeWordLocation } from 'src/utils/verse';
import QueryParam from 'types/QueryParam';
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
  const { value: reciterId }: { value: number } = useGetQueryParamOrReduxValue(QueryParam.Reciter);

  const chapterId = word.verseKey ? getChapterNumberFromKey(word.verseKey) : null;
  const { data: audioData } = useSWRImmutable(
    chapterId ? makeChapterAudioDataUrl(reciterId, chapterId, true) : null,
    () => getChapterAudioData(reciterId, chapterId, true),
  );

  const showTooltipWhenPlayingAudio = useSelector(selectShowTooltipWhenPlayingAudio);

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
    wordText = (
      <GlyphWord
        font={font}
        qpcUthmaniHafs={word.qpcUthmaniHafs}
        pageNumber={word.pageNumber}
        textCodeV1={word.codeV1}
        textCodeV2={word.codeV2}
        isFontLoaded={isFontLoaded}
      />
    );
  } else if (font === QuranFont.Tajweed) {
    wordText = <TajweedWord path={word.text} alt={word.textUthmani} />;
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
  const translationViewTooltipContent = useMemo(
    () => (isWordByWordAllowed ? getTooltipText(showTooltipFor, word) : null),
    [isWordByWordAllowed, showTooltipFor, word],
  );

  const onClick = useCallback(() => {
    if (wordClickFunctionality === WordClickFunctionality.PlayAudio && audioData) {
      logButtonClick('quran_word_pronounce');
      onQuranWordClick(word, audioData);
    } else {
      logButtonClick('quran_word');
    }
  }, [audioData, word, wordClickFunctionality]);

  return (
    <div
      {...(readingPreference === ReadingPreference.Translation && { onClick, onKeyPress: onClick })}
      role="button"
      tabIndex={0}
      {...{
        [DATA_ATTRIBUTE_WORD_LOCATION]: wordLocation,
      }}
      className={classNames(styles.container, {
        [styles.highlighted]: shouldBeHighLighted,
        [styles.secondaryHighlight]: shouldShowSecondaryHighlight,
        [styles.wbwContainer]: isWordByWordLayout,
        [styles.additionalWordGap]: readingPreference === ReadingPreference.Translation,
        [styles.tajweedWord]: font === QuranFont.Tajweed,
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
          {showWordByWordTransliteration && (
            <p className={styles.wbwText}>{word.transliteration?.text}</p>
          )}
          {showWordByWordTranslation && <p className={styles.wbwText}>{word.translation?.text}</p>}
        </>
      )}
    </div>
  );
};

export default memo(QuranWord);
