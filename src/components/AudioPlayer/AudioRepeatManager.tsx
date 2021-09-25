import { useEffect, useState } from 'react';

import useSWRImmutable from 'swr/immutable';

import { triggerPauseAudio, triggerPlayAudio, triggerSetCurrentTime } from './EventTriggers';
import useAudioPlayerCurrentTime from './hooks/useCurrentTime';
import useMemoizedHighlightedVerseTiming from './hooks/useMemoizedHighlightedVerseTiming';

import { getChapterAudioFile } from 'src/api';
import { makeChapterAudioFilesUrl } from 'src/utils/apiPaths';
import VerseTiming from 'types/VerseTiming';

type FindAGoodNameProps = {
  audioPlayerElRef: React.MutableRefObject<HTMLAudioElement>;
  reciterId: number;
  chapterId: number;
};
// eslint-disable-next-line react-func/max-lines-per-function
const FindAGoodName = ({ audioPlayerElRef, reciterId, chapterId }: FindAGoodNameProps) => {
  const [repeatVerse, setRepeatVerse] = useState({
    total: 2,
    progress: 0,
  });
  const [repeatVerseRange, setRepeatVerseRange] = useState({
    total: 2,
    progress: 0,
    range: { from: '1:1', to: '1:7' },
  });
  const { data: audioFileData } = useSWRImmutable(
    makeChapterAudioFilesUrl(reciterId, chapterId, true),
    () => getChapterAudioFile(reciterId, chapterId, true),
  );
  const currentTime = useAudioPlayerCurrentTime(audioPlayerElRef);
  const currentTimeInMs = currentTime * 1000;

  const currentHighlightedVerseTiming = useMemoizedHighlightedVerseTiming(
    currentTimeInMs,
    audioFileData,
  );

  console.log(repeatVerseRange, repeatVerse);

  // eslint-disable-next-line react-func/max-lines-per-function
  useEffect(() => {
    if (!currentHighlightedVerseTiming) return null;
    if (!audioFileData) return null;
    if (currentTimeInMs >= currentHighlightedVerseTiming.timestampTo) {
      triggerPauseAudio();
      setTimeout(() => triggerPlayAudio(), 3000); // TODO: use real value for `3000`

      if (repeatVerse.progress <= repeatVerse.total) {
        setRepeatVerse((prevState) => ({ ...prevState, progress: prevState.progress + 1 }));
        triggerSetCurrentTime(currentHighlightedVerseTiming.timestampFrom);
      } else {
        setRepeatVerse((prevState) => ({ ...prevState, progress: 0 }));
      }

      const verseRangeTo = getVerseTimingByVerseKey(
        repeatVerseRange.range.to,
        audioFileData.verseTimings,
      );
      if (currentTime >= verseRangeTo.timestampTo) {
        if (repeatVerseRange.progress <= repeatVerseRange.total) {
          setRepeatVerseRange((prevState) => ({
            ...prevState,
            progress: prevState.progress + 1,
          }));
          triggerSetCurrentTime(verseRangeTo.timestampFrom);
        } else {
          setRepeatVerseRange((prevState) => ({
            ...prevState,
            progress: 0,
          }));
        }
      }
    }

    return null;
  }, [
    currentTimeInMs,
    currentHighlightedVerseTiming,
    currentTime,
    repeatVerse.progress,
    repeatVerse.total,
    repeatVerseRange.range.to,
    repeatVerseRange.progress,
    repeatVerseRange.total,
    audioFileData,
  ]);

  return null;
};

const getVerseTimingByVerseKey = (verseKey: string, verseTimings: VerseTiming[]) => {
  return verseTimings.find((verseTiming) => verseTiming.verseKey === verseKey);
};

export default FindAGoodName;
