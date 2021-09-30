import { triggerPauseAudio, triggerPlayAudio, triggerSetCurrentTime } from '../EventTriggers';

const checkShouldRepeatVerse = ({ isVerseEnded, repeatProgress, repeatSettings }) =>
  isVerseEnded && repeatProgress.repeatEachVerse < repeatSettings.repeatEachVerse;
export const checkShouldStopAudio = ({ isRangeEnded, repeatProgress, repeatSettings }) =>
  isRangeEnded && repeatProgress.repeatRange >= repeatSettings.repeatRange;
const checkShouldResetVerseProgress = ({ isVerseEnded, repeatProgress, repeatSettings }) =>
  isVerseEnded && repeatProgress.repeatEachVerse >= repeatSettings.repeatEachVerse;
const checkShouldRepeatRange = ({ isRangeEnded, repeatProgress, repeatSettings }) =>
  isRangeEnded && repeatProgress.repeatRange < repeatSettings.repeatRange;

export const getNextProgressState = ({
  isVerseEnded,
  isRangeEnded,
  repeatProgress,
  repeatSettings,
}) => {
  let nextRepeatEachVerseProgress = repeatProgress.repeatEachVerse;
  if (checkShouldRepeatVerse({ isVerseEnded, repeatProgress, repeatSettings }))
    nextRepeatEachVerseProgress += 1;
  if (checkShouldResetVerseProgress({ isVerseEnded, repeatProgress, repeatSettings }))
    nextRepeatEachVerseProgress = 1;

  let nextRepeatRangeProgress = repeatProgress.repeatRange;
  if (checkShouldRepeatRange({ isRangeEnded, repeatProgress, repeatSettings }))
    nextRepeatRangeProgress += 1;
  if (checkShouldStopAudio({ isRangeEnded, repeatProgress, repeatSettings }))
    nextRepeatRangeProgress = 1;

  return {
    repeatEachVerse: nextRepeatEachVerseProgress,
    repeatRange: nextRepeatRangeProgress,
  };
};

// when delayMultiplier > 0, and range not ended. Delay the audio
export const delayAudioWhenVerseChanged = ({
  delayMultiplier,
  isVerseEnded,
  isRangeEnded,
  repeatProgress,
  repeatSettings,
  duration,
}) => {
  if (delayMultiplier <= 0) return;
  const shouldStopAudio = checkShouldStopAudio({ isRangeEnded, repeatProgress, repeatSettings });
  const shouldDelayAudio = !shouldStopAudio && (isVerseEnded || isRangeEnded);
  if (shouldDelayAudio) {
    triggerPauseAudio();
    setTimeout(triggerPlayAudio, duration);
  }
};

// calculate the duration between timestampFrom and timestampTo * delayMultiplierBetweenVerse
export const getDelay = ({ delayMultiplier, verseTiming }) => {
  const { timestampTo, timestampFrom } = verseTiming;
  return delayMultiplier * (timestampTo - timestampFrom);
};

// get new time for audio player based on given data
export const repeatVerseOrRange = ({
  isVerseEnded,
  isRangeEnded,
  rangeTimestampFrom,
  verseTimestampFrom,
  repeatProgress,
  repeatSettings,
}): number => {
  if (checkShouldRepeatVerse({ isVerseEnded, repeatProgress, repeatSettings }))
    triggerSetCurrentTime(verseTimestampFrom / 1000);
  if (checkShouldRepeatRange({ isRangeEnded, repeatProgress, repeatSettings }))
    triggerSetCurrentTime(rangeTimestampFrom / 1000);
  return null;
};
