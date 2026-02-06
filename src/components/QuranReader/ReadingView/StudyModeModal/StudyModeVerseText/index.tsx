import React, { useCallback, useContext } from 'react';

import classNames from 'classnames';
import { shallowEqual, useSelector } from 'react-redux';

import useIsFontLoaded from '@/components/QuranReader/hooks/useIsFontLoaded';
import PlainVerseTextWord from '@/components/Verse/PlainVerseText/PlainVerseTextWord';
import SeoTextForVerse from '@/components/Verse/SeoTextForVerse';
import TajweedFontPalettes from '@/components/Verse/TajweedFontPalettes';
import styles from '@/components/Verse/VerseText.module.scss';
import GlyphWord from '@/dls/QuranWord/GlyphWord';
import playWordAudio from '@/dls/QuranWord/playWordAudio';
import TextWord from '@/dls/QuranWord/TextWord';
import {
  selectInlineDisplayWordByWordPreferences,
  selectWordClickFunctionality,
} from '@/redux/slices/QuranReader/readingPreferences';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { WordClickFunctionality } from '@/types/QuranReader';
import { milliSecondsToSeconds } from '@/utils/datetime';
import { getFontClassName, isQCFFont } from '@/utils/fontFaceHelper';
import { getChapterNumberFromKey } from '@/utils/verse';
import { getWordTextFieldNameByFont } from '@/utils/word';
import { getWordTimeSegment } from 'src/xstate/actors/audioPlayer/audioPlayerMachineHelper';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';
import Word, { CharType } from 'types/Word';

interface StudyModeVerseTextProps {
  words: Word[];
  highlightedWordLocation?: string;
  onWordClick?: (word: Word) => void;
}

const StudyModeVerseText: React.FC<StudyModeVerseTextProps> = ({
  words,
  highlightedWordLocation,
  onWordClick,
}) => {
  const { quranFont, quranTextFontScale, mushafLines } = useSelector(
    selectQuranReaderStyles,
    shallowEqual,
  );
  const wordClickFunctionality = useSelector(selectWordClickFunctionality);
  const { showWordByWordTranslation, showWordByWordTransliteration } = useSelector(
    selectInlineDisplayWordByWordPreferences,
    shallowEqual,
  );
  const audioService = useContext(AudioPlayerMachineContext);

  const isRecitationEnabled = wordClickFunctionality === WordClickFunctionality.PlayAudio;

  const isQcfFont = isQCFFont(quranFont);
  const firstWord = words?.[0];
  const pageNumber = firstWord?.pageNumber;
  const isFontLoaded = useIsFontLoaded(pageNumber, quranFont);

  const handleWordClick = useCallback(
    (word: Word) => {
      if (word.charTypeName !== CharType.Word) {
        return;
      }

      if (isRecitationEnabled) {
        const currentState = audioService.getSnapshot();
        const isPlaying = currentState.matches('VISIBLE.AUDIO_PLAYER_INITIATED.PLAYING');
        const currentSurah = getChapterNumberFromKey(word.verseKey);
        const isSameSurah = currentState.context.surah === Number(currentSurah);
        const shouldSeekTo = isPlaying && isSameSurah;

        if (shouldSeekTo) {
          const wordSegment = getWordTimeSegment(currentState.context.audioData.verseTimings, word);
          if (wordSegment) {
            const [startTime] = wordSegment;
            audioService.send({ type: 'SEEK_TO', timestamp: milliSecondsToSeconds(startTime) });
          }
        } else {
          playWordAudio(word);
        }
      }

      if (onWordClick) {
        onWordClick(word);
      }
    },
    [onWordClick, isRecitationEnabled, audioService],
  );

  if (!words || words.length === 0) {
    return null;
  }

  return (
    <>
      <SeoTextForVerse words={words} />
      <TajweedFontPalettes pageNumber={pageNumber} quranFont={quranFont} />
      <div
        className={classNames(
          styles.verseTextContainer,
          styles.tafsirOrTranslationMode,
          styles[getFontClassName(quranFont, quranTextFontScale, mushafLines)],
        )}
      >
        <div className={classNames(styles.verseText, styles.verseTextWrap)} translate="no">
          {words?.map((word) => {
            const isHighlighted =
              highlightedWordLocation && word.location === highlightedWordLocation;

            const textFieldName = getWordTextFieldNameByFont(quranFont);
            const wordText =
              word[textFieldName] || word.textUthmani || word.text || word.qpcUthmaniHafs || '';

            const wordContent = isQcfFont ? (
              <GlyphWord
                font={quranFont}
                qpcUthmaniHafs={word.qpcUthmaniHafs || word.textUthmani || ''}
                pageNumber={word.pageNumber}
                textCodeV1={word.codeV1}
                textCodeV2={word.codeV2}
                isFontLoaded={isFontLoaded}
                isHighlighted={isHighlighted}
              />
            ) : (
              <TextWord font={quranFont} text={wordText} charType={word.charTypeName} />
            );

            return (
              <div
                key={word.location}
                onClick={() => handleWordClick(word)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleWordClick(word);
                  }
                }}
                role="button"
                tabIndex={word.charTypeName === CharType.Word ? 0 : -1}
                style={{ cursor: word.charTypeName === CharType.Word ? 'pointer' : 'default' }}
              >
                <PlainVerseTextWord
                  word={word}
                  shouldShowWordByWordTranslation={showWordByWordTranslation}
                  shouldShowWordByWordTransliteration={showWordByWordTransliteration}
                  isHighlighted={isHighlighted}
                >
                  {wordContent}
                </PlainVerseTextWord>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default StudyModeVerseText;
