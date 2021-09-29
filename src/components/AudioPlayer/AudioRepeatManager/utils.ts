import { triggerPauseAudio, triggerPlayAudio } from '../EventTriggers';

// calculate the duration between timestampFrom and timestampTo * delayMultiplierBetweenVerse
const getDelay = ({ delayMultiplierBetweenVerse, verseTiming }) => {
  const { timestampTo, timestampFrom } = verseTiming;
  return delayMultiplierBetweenVerse * (timestampTo - timestampFrom);
};

// based on given conditions, decide when to stop the audio and when to delay the audio
export const stopOrDelayAudio = ({
  shouldStopAudio,
  shouldDelayAudio,
  delayMultiplierBetweenVerse,
  verseTiming,
}) => {
  if (shouldStopAudio) triggerPauseAudio();
  if (shouldDelayAudio) {
    triggerPauseAudio();
    const delay = getDelay({ delayMultiplierBetweenVerse, verseTiming });
    setTimeout(triggerPlayAudio, delay);
  }
};

// based on given data, returns a map of action -> boolean
export const getNextActions = ({
  repeatRange,
  currentTimeInMs,
  activeVerseTiming,
  repeatVerse,
  verseRangeTo,
  delayMultiplierBetweenVerse,
}) => {
  const shouldRepeatVerse =
    currentTimeInMs >= activeVerseTiming.timestampTo &&
    repeatVerse.current.progress < repeatVerse.current.total;
  const shouldResetVerseProgress =
    currentTimeInMs >= activeVerseTiming.timestampTo &&
    repeatVerse.current.progress >= repeatVerse.current.total;

  const shouldRepeatRange =
    currentTimeInMs >= verseRangeTo.timestampTo &&
    repeatRange.current.progress < repeatRange.current.total;

  const shouldStopAudio =
    currentTimeInMs >= verseRangeTo.timestampTo &&
    repeatRange.current.progress >= repeatRange.current.total;

  const shouldDelayAudio =
    !shouldStopAudio &&
    delayMultiplierBetweenVerse > 0 &&
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
  lastActiveVerseTiming,
  verseRangeFrom,
}): number => {
  if (shouldRepeatVerse) return lastActiveVerseTiming.current.timestampFrom / 1000;
  if (shouldRepeatRange) return verseRangeFrom.timestampFrom / 1000;
  return null;
};
