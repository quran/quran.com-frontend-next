import {
  HighlightedLocationState,
  initialState as defaultHighlightStatus,
} from 'src/redux/slices/QuranReader/highlightedLocation';
import { getVerseAndChapterNumbersFromKey } from 'src/utils/verse';
import VerseTiming from 'types/VerseTiming';

/**
 * given the currentTime of the audio player and the verseTimings
 * determine which `chapter`, `verse`, and `word` should currently be highlighted
 *
 * @param {number} currentTime
 * @param {VerseTiming[]} verseTimings
 * @returns {HighlightedLocationState} highlightStatus
 */
const getHighlightedLocation = (
  currentTime: number,
  verseTimings: VerseTiming[],
): HighlightedLocationState => {
  const selectedVerse = verseTimings.find(
    (verse) => currentTime >= verse.timestampFrom && currentTime <= verse.timestampTo,
  );

  if (!selectedVerse) return defaultHighlightStatus;
  const selectedWord = selectedVerse.segments.find((segment) => {
    const [, timestampFrom, timestampTo] = segment; // the structure of the segment is: [wordLocation, timestampFrom, timestampTo]
    return currentTime >= timestampFrom && currentTime <= timestampTo;
  });

  if (!selectedWord) return defaultHighlightStatus;

  const [chapter, verse] = getVerseAndChapterNumbersFromKey(selectedVerse.verseKey);
  const word = selectedWord[0] + 1; // word location starts at 1 instead of 0, while the the data from API starts at 0
  return {
    chapter: Number(chapter),
    verse: Number(verse),
    word,
  };
};

export default getHighlightedLocation;
