import { useEffect, useRef } from 'react';

import { shallowEqual, useSelector } from 'react-redux';
import useSWRImmutable from 'swr/immutable';

import { triggerPauseAudio, triggerPlayAudio, triggerSetCurrentTime } from './EventTriggers';
import useAudioPlayerCurrentTime from './hooks/useCurrentTime';
import useMemoizedHighlightedVerseTiming from './hooks/useMemoizedHighlightedVerseTiming';

import { getChapterAudioFile } from 'src/api';
import {
  getVerseTimingByVerseKey,
  selectIsInRepeatMode,
  selectRepeatSettings,
} from 'src/redux/slices/AudioPlayer/state';
import { makeChapterAudioFilesUrl } from 'src/utils/apiPaths';
import { getChapterData } from 'src/utils/chapter';
import { makeVerseKey } from 'src/utils/verse';
import VerseTiming from 'types/VerseTiming';

type FindAGoodNameProps = {
  audioPlayerElRef: React.MutableRefObject<HTMLAudioElement>;
  reciterId: number;
  chapterId: number;
};
// eslint-disable-next-line react-func/max-lines-per-function
const FindAGoodName = ({ audioPlayerElRef, reciterId, chapterId }: FindAGoodNameProps) => {
  const repeatSettings = useSelector(selectRepeatSettings, shallowEqual);
  const chapterData = getChapterData(chapterId.toString());
  const isInRepeatMode = useSelector(selectIsInRepeatMode);
  const repeatVerse = useRef({
    total: 1,
    progress: 1,
  });
  const repeatVerseRange = useRef({
    total: 1,
    progress: 1,
    range: {
      from: null,
      to: null,
    },
  });
  const delayMultiplierBetweenVerse = useRef(0);
  const { data: audioFileData, isValidating } = useSWRImmutable(
    makeChapterAudioFilesUrl(reciterId, chapterId, true),
    () => getChapterAudioFile(reciterId, chapterId, true),
  );
  const currentTime = useAudioPlayerCurrentTime(audioPlayerElRef);
  const currentTimeInMs = Math.floor(currentTime * 1000);

  const lastHighlightedVerseTiming = useRef<VerseTiming>(null);
  const currentHighlightedVerseTiming = useMemoizedHighlightedVerseTiming(
    currentTimeInMs,
    audioFileData,
  );

  useEffect(() => {
    if (!repeatSettings.from || !repeatSettings.to) return null;

    // reset the progress
    repeatVerse.current.progress = 1;
    repeatVerseRange.current.progress = 1;

    // set the setting
    repeatVerse.current.total = repeatSettings.repeatEachVerse;
    repeatVerseRange.current.total = repeatSettings.repeatRange;
    repeatVerseRange.current.range.from = repeatSettings.from;
    repeatVerseRange.current.range.to = repeatSettings.to;
    delayMultiplierBetweenVerse.current = repeatSettings.delayMultiplierBetweenVerse;

    return null;
  }, [
    repeatSettings.from,
    repeatSettings.to,
    repeatSettings.repeatEachVerse,
    repeatSettings.repeatRange,
    repeatSettings.delayMultiplierBetweenVerse,
  ]);

  // eslint-disable-next-line react-func/max-lines-per-function
  useEffect(() => {
    if (!lastHighlightedVerseTiming.current) return null;
    if (!audioFileData || isValidating) return null;
    if (!isInRepeatMode) return null;

    const verseRangeTo = getVerseTimingByVerseKey(
      repeatVerseRange.current.range.to,
      audioFileData.verseTimings,
    );
    const verseRangeFrom = getVerseTimingByVerseKey(
      repeatVerseRange.current.range.from,
      audioFileData.verseTimings,
    );

    const shouldRepeatVerse =
      currentTimeInMs >= lastHighlightedVerseTiming.current.timestampTo &&
      repeatVerse.current.progress < repeatVerse.current.total;
    const shouldResetVerseProgress =
      currentTimeInMs >= lastHighlightedVerseTiming.current.timestampTo &&
      repeatVerse.current.progress >= repeatVerse.current.total;

    const shouldRepeatRange =
      currentTimeInMs >= verseRangeTo.timestampTo &&
      repeatVerseRange.current.progress < repeatVerseRange.current.total;

    const shouldStop =
      currentTimeInMs >= verseRangeTo.timestampTo &&
      repeatVerseRange.current.progress >= repeatVerseRange.current.total;

    const getNewTime = (): number => {
      if (shouldRepeatVerse) return lastHighlightedVerseTiming.current.timestampFrom / 1000;
      if (shouldRepeatRange) return verseRangeFrom.timestampFrom / 1000;
      return null;
    };

    const shouldDelayAudio =
      !shouldStop &&
      delayMultiplierBetweenVerse.current > 0 &&
      (shouldRepeatVerse || shouldRepeatRange || shouldResetVerseProgress);

    const newtime = getNewTime();
    if (typeof newtime === 'number') triggerSetCurrentTime(newtime);
    if (shouldRepeatVerse) repeatVerse.current.progress += 1;
    if (shouldResetVerseProgress) repeatVerse.current.progress = 1;
    if (shouldRepeatRange) repeatVerseRange.current.progress += 1;
    if (shouldStop) {
      repeatVerseRange.current.range.from = makeVerseKey(Number(chapterData.id), 1);
      repeatVerseRange.current.range.to = makeVerseKey(
        Number(chapterData.id),
        chapterData.versesCount,
      );
      triggerPauseAudio();
    }
    if (shouldDelayAudio) {
      triggerPauseAudio();
      const delay =
        delayMultiplierBetweenVerse.current *
        (lastHighlightedVerseTiming.current.timestampTo -
          lastHighlightedVerseTiming.current.timestampFrom);
      setTimeout(triggerPlayAudio, delay);
    }

    return null;
  }, [
    currentTimeInMs,
    currentHighlightedVerseTiming,
    audioFileData,
    chapterData.id,
    chapterData.versesCount,
    isValidating,
    isInRepeatMode,
  ]);

  useEffect(() => {
    lastHighlightedVerseTiming.current = currentHighlightedVerseTiming;
  }, [currentHighlightedVerseTiming]);

  return null;
};

export default FindAGoodName;
