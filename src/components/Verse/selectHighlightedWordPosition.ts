import inRange from 'lodash/inRange';
import { selectCurrentTime } from 'src/redux/slices/AudioPlayer/state';

const shouldHighlight = (currentTime: number, segment: number[]) => {
  const startTime = segment[1];
  const endTime = segment[2];
  const currentTimeInMiliseconds = currentTime * 1000;
  return inRange(currentTimeInMiliseconds, startTime, endTime);
};

const findHighlightedPosition = (currentTime: number, timestampSegments: [number[]]) => {
  if (!timestampSegments) return null;
  const highlightedSegment = timestampSegments.find((segment) =>
    shouldHighlight(currentTime, segment),
  );
  if (!highlightedSegment) return null;
  const wordPosition = highlightedSegment[0];
  return wordPosition + 1;
};

// to be used with `useSelector` to prevent unnecassary re rendering
const selectHighlightedWordPosition = (state, timestampSegments: [number[]]) => {
  const currentTime = selectCurrentTime(state);
  return findHighlightedPosition(currentTime, timestampSegments);
};

export default selectHighlightedWordPosition;
