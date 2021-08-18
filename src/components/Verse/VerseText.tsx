import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import Word, { CharType } from 'types/Word';
import { selectReadingPreference } from 'src/redux/slices/QuranReader/readingPreference';
import classNames from 'classnames';
import { selectCurrentTime } from 'src/redux/slices/AudioPlayer/state';
import inRange from 'lodash/inRange';
import QuranWord from '../dls/QuranWord/QuranWord';
import { QuranReaderStyles, selectQuranReaderStyles } from '../../redux/slices/QuranReader/styles';
import { ReadingPreference } from '../QuranReader/types';
import isCenterAlignedPage from './pageUtils';
import styles from './VerseText.module.scss';

type VerseTextProps = {
  words: Word[];
  timestampSegments?: [number[]];
};

const shouldHighlight = (currentTime: number, segment: number[]) => {
  const startTime = segment[1];
  const endTime = segment[2];
  const currentTimeInMiliseconds = currentTime * 1000;
  const introDuration = 6000; // temporary hack (only works for mishary), need to be fixed on backend
  return inRange(currentTimeInMiliseconds - introDuration, startTime, endTime);
};

const VerseText = ({ words, timestampSegments }: VerseTextProps) => {
  const quranReaderStyles = useSelector(selectQuranReaderStyles) as QuranReaderStyles;
  const currentTime = useSelector(selectCurrentTime);
  const { quranTextFontScale } = quranReaderStyles;
  const readingPreference = useSelector(selectReadingPreference);
  const isReadingMode = readingPreference === ReadingPreference.Reading;
  const { lineNumber, pageNumber } = words[0];
  const centerAlignPage = useMemo(
    () => isCenterAlignedPage(pageNumber, lineNumber),
    [pageNumber, lineNumber],
  );

  return (
    <div
      className={classNames(
        styles.verseTextContainer,
        styles[`quran-font-size-${quranTextFontScale}`],
      )}
    >
      <div
        className={classNames(styles.verseText, {
          [styles.verseTextCenterAlign]: isReadingMode && centerAlignPage,
          [styles.verseTextSpaceBetween]: isReadingMode && !centerAlignPage,
        })}
      >
        {words?.map((word, index) => {
          const highlight =
            timestampSegments &&
            // example: bismillahirrahmanirrahim, is detected as 4 words with chapterTypeName 'word'
            // + 1 word with chapterTypeName 'end'. So 5 word in total. Need to check before doing shouldHighlight
            word.charTypeName === CharType.Word &&
            shouldHighlight(currentTime, timestampSegments[index]);

          return (
            <QuranWord
              key={word.location}
              word={word}
              font={quranReaderStyles.quranFont}
              highlight={highlight}
            />
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(VerseText);
