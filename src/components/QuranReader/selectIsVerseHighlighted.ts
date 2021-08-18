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

export default selectIsVerseHighlighted;
