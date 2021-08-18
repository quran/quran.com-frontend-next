import { selectAudioFile, selectCurrentTime } from 'src/redux/slices/AudioPlayer/state';
import Verse from 'types/Verse';
import inRange from 'lodash/inRange';

const selectIsVerseHighlighted = (state, verse: Verse) => {
  const audioFile = selectAudioFile(state);
  if (verse.chapterId !== audioFile.chapterId) return false;

  const currentTime = selectCurrentTime(state);
  const currentTimeInSeconds = currentTime * 1000;
  return inRange(
    currentTimeInSeconds,
    verse.timestamps.timestampFrom,
    verse.timestamps.timestampTo,
  );
};

const shouldHighlightWord = (currentTime: number, segment: number[]) => {
  const startTime = segment[1];
  const endTime = segment[2];
  const currentTimeInMiliseconds = currentTime * 1000;
  return inRange(currentTimeInMiliseconds, startTime, endTime);
};

const findHighlightedWordPosition = (currentTime: number, timestampSegments: [number[]]) => {
  if (!timestampSegments) return null;
  const highlightedSegment = timestampSegments.find((segment) =>
    shouldHighlightWord(currentTime, segment),
  );
  if (!highlightedSegment) return null;
  const wordPosition = highlightedSegment[0];
  return wordPosition + 1;
};

// to be used with `useSelector` to prevent unnecassary re rendering
const selectHighlightedWordPosition = (state, timestampSegments: [number[]]) => {
  const currentTime = selectCurrentTime(state);
  return findHighlightedWordPosition(currentTime, timestampSegments);
};

const selectVerseHighlight = (state, verse: Verse) => ({
  highlighted: selectIsVerseHighlighted(state, verse),
  position: selectHighlightedWordPosition(state, verse.timestamps.segments),
});

export default selectVerseHighlight;
