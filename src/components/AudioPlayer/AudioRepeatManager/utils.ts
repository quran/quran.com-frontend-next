import { triggerPauseAudio, triggerPlayAudio } from '../EventTriggers';

import { getChapterData } from 'src/utils/chapter';
import { makeVerseKey } from 'src/utils/verse';

const getDelay = ({ delayMultiplierBetweenVerse, lastHighlightedVerseTiming }) => {
  const { timestampTo, timestampFrom } = lastHighlightedVerseTiming.current;
  return delayMultiplierBetweenVerse * (timestampTo - timestampFrom);
};

export const stopOrDelayAudio = ({
  shouldStopAudio,
  shouldDelayAudio,
  delayMultiplierBetweenVerse,
  lastHighlightedVerseTiming,
}) => {
  if (shouldStopAudio) triggerPauseAudio();
  if (shouldDelayAudio) {
    triggerPauseAudio();
    const delay = getDelay({ delayMultiplierBetweenVerse, lastHighlightedVerseTiming });
    setTimeout(triggerPlayAudio, delay);
  }
};

export const getNextAction = ({
  repeatRange,
  currentTimeInMs,
  lastHighlightedVerseTiming,
  repeatVerse,
  verseRangeTo,
  delayMultiplierBetweenVerse,
}) => {
  const shouldRepeatVerse =
    currentTimeInMs >= lastHighlightedVerseTiming.current.timestampTo &&
    repeatVerse.current.progress < repeatVerse.current.total;
  const shouldResetVerseProgress =
    currentTimeInMs >= lastHighlightedVerseTiming.current.timestampTo &&
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

export const getNewTime = ({
  shouldRepeatVerse,
  shouldRepeatRange,
  lastHighlightedVerseTiming,
  verseRangeFrom,
}): number => {
  if (shouldRepeatVerse) return lastHighlightedVerseTiming.current.timestampFrom / 1000;
  if (shouldRepeatRange) return verseRangeFrom.timestampFrom / 1000;
  return null;
};

export const getChapterFirstAndLastVerseKey = (chapterId) => {
  const chapterData = getChapterData(chapterId.toString());
  return {
    first: makeVerseKey(Number(chapterData.id), 1),
    last: makeVerseKey(Number(chapterData.id), chapterData.versesCount),
  };
};
