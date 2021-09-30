import { triggerPauseAudio, triggerPlayAudio } from '../EventTriggers';

// calculate the duration between timestampFrom and timestampTo * delayMultiplier
const getDelay = ({ delayMultiplier, verseTiming }) => {
  const { timestampTo, timestampFrom } = verseTiming;
  return delayMultiplier * (timestampTo - timestampFrom);
};

// based on given conditions, decide when to stop the audio and when to delay the audio
export const stopOrDelayAudio = ({
  shouldStopAudio,
  shouldDelayAudio,
  delayMultiplier,
  verseTiming,
}) => {
  if (shouldStopAudio) triggerPauseAudio();
  if (shouldDelayAudio) {
    triggerPauseAudio();
    const delay = getDelay({ delayMultiplier, verseTiming });
    setTimeout(triggerPlayAudio, delay);
  }
};

// based on given data, returns a map of action -> boolean
export const getConditions = ({
  repeatSettings,
  repeatProgress,
  currentTimeInMs,
  activeVerseTiming,
  verseRangeTo,
  delayMultiplier,
}) => {
  const isVerseEnded = currentTimeInMs >= activeVerseTiming.timestampTo;

  const shouldRepeatVerse =
    isVerseEnded && repeatProgress.repeatEachVerse < repeatSettings.repeatEachVerse;
  const shouldResetVerseProgress =
    isVerseEnded && repeatProgress.repeatEachVerse >= repeatSettings.repeatEachVerse;

  const isRangeEnded = currentTimeInMs >= verseRangeTo.timestampTo;
  const shouldRepeatRange = isRangeEnded && repeatProgress.repeatRange < repeatSettings.repeatRange;
  const shouldStopAudio = isRangeEnded && repeatProgress.repeatRange >= repeatSettings.repeatRange;

  const shouldDelayAudio =
    !shouldStopAudio &&
    delayMultiplier > 0 &&
    (shouldRepeatVerse || shouldRepeatRange || shouldResetVerseProgress);

  return {
    shouldRepeatVerse,
    shouldResetVerseProgress,
    shouldRepeatRange,
    shouldStopAudio,
    shouldDelayAudio,
  };
};

// get new time for audio player based on given data
export const getNewTime = ({
  shouldRepeatVerse,
  shouldRepeatRange,
  verseTiming,
  verseRangeFrom,
}): number => {
  if (shouldRepeatVerse) return verseTiming.timestampFrom / 1000;
  if (shouldRepeatRange) return verseRangeFrom.timestampFrom / 1000;
  return null;
};
