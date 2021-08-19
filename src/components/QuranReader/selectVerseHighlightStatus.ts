import { selectAudioFile, selectCurrentTime } from 'src/redux/slices/AudioPlayer/state';
import Verse from 'types/Verse';
import inRange from 'lodash/inRange';

// Returns whether the verse should be highlighted the given the current audio timestamp
const selectIsVerseHighlighted = (state, verse: Verse) => {
  const audioFile = selectAudioFile(state);
  if (!audioFile) return false;
  if (verse.chapterId !== audioFile.chapterId) return false;

  const currentTime = selectCurrentTime(state);
  const currentTimeInMilliseconds = currentTime * 1000;
  return inRange(
    currentTimeInMilliseconds,
    verse.timestamps.timestampFrom,
    verse.timestamps.timestampTo,
  );
};

// given the currentTime and an audio segment
// segment is an array of three numbers. e.g [1, 200, 300]
// meaning word index 1, start time 200, end time 300.
// see if the current time is between 200 and 300
const shouldHighlightWord = (currentTime: number, segment: number[]) => {
  const startTime = segment[1];
  const endTime = segment[2];
  const currentTimeInMilliseconds = currentTime * 1000;
  return inRange(currentTimeInMilliseconds, startTime, endTime);
};

// given the currentTime and an array of segments
// (e.g timestampSegments:  [ [1, 200, 300], [2, 300, 1200] ])
// currentTime is 500, it should return 2. But we do 2 + 1 since word position is index + 1
const findHighlightedWordPosition = (currentTime: number, timestampSegments: [number[]]) => {
  if (!timestampSegments) return null;
  const highlightedSegment = timestampSegments.find((segment) =>
    shouldHighlightWord(currentTime, segment),
  );
  if (!highlightedSegment) return null;
  const wordPosition = highlightedSegment[0];
  return wordPosition + 1; // +1 because the word position is not 0 based. while in timestampSegments it is 0 based
};

// given the current audio timestamp, and array of segment audio segments
// see which word should be highlighted, and then return the word position
const selectHighlightedWordPosition = (state, timestampSegments: [number[]]) => {
  const currentTime = selectCurrentTime(state);
  return findHighlightedWordPosition(currentTime, timestampSegments);
};

// given the current audio timestamp, and the Verse data
// we want to see if "this verse should be highlighted or not"
// and "which word in this verse should be highlighted"
// TODO: @muhajirdev, review efficiency of this function. Check if https://github.com/reduxjs/reselect can boost performance
const selectVerrseHighlightStatus = (state, verse: Verse) => ({
  verseHighlighted: selectIsVerseHighlighted(state, verse),
  wordPosition: selectHighlightedWordPosition(state, verse.timestamps.segments),
});

export default selectVerrseHighlightStatus;
