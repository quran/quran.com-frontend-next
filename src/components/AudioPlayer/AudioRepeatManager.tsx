import { useEffect, useRef } from 'react';

import useSWRImmutable from 'swr/immutable';

import { triggerPauseAudio, triggerSetCurrentTime } from './EventTriggers';
import useAudioPlayerCurrentTime from './hooks/useCurrentTime';
import useMemoizedHighlightedVerseTiming from './hooks/useMemoizedHighlightedVerseTiming';

import { getChapterAudioFile } from 'src/api';
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
  const chapterData = getChapterData(chapterId.toString());
  const repeatVerse = useRef({
    total: 0,
    progress: 0,
  });
  const repeatVerseRange = useRef({
    total: 1,
    progress: 0,
    range: {
      from: makeVerseKey(Number(chapterData.id), 1),
      to: makeVerseKey(Number(chapterData.id), 2), // test repeat verse 1 - 2
    },
  });
  const { data: audioFileData } = useSWRImmutable(
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

  // eslint-disable-next-line react-func/max-lines-per-function
  useEffect(() => {
    if (!lastHighlightedVerseTiming.current) return null;
    if (!audioFileData) return null;
    if (currentTimeInMs >= lastHighlightedVerseTiming.current.timestampTo) {
      // triggerPauseAudio();
      // setTimeout(() => triggerPlayAudio(), 1000); // TODO: use real value for `3000`

      if (repeatVerse.current.progress < repeatVerse.current.total) {
        repeatVerse.current.progress += 1;
        triggerSetCurrentTime(lastHighlightedVerseTiming.current.timestampFrom / 1000); // audioPlayerEl operates in second not ms
      } else {
        repeatVerse.current.progress = 0;
      }

      const verseRangeTo = getVerseTimingByVerseKey(
        repeatVerseRange.current.range.to,
        audioFileData.verseTimings,
      );
      const verseRangeFrom = getVerseTimingByVerseKey(
        repeatVerseRange.current.range.from,
        audioFileData.verseTimings,
      );
      if (currentTimeInMs >= verseRangeTo.timestampTo) {
        if (repeatVerseRange.current.progress < repeatVerseRange.current.total) {
          repeatVerseRange.current.progress += 1;
          triggerSetCurrentTime(verseRangeFrom.timestampFrom / 1000);
        } else {
          repeatVerseRange.current.progress = 0;
          triggerPauseAudio();
        }
      }
    }

    return null;
  }, [currentTimeInMs, currentHighlightedVerseTiming, currentTime, audioFileData]);

  useEffect(() => {
    lastHighlightedVerseTiming.current = currentHighlightedVerseTiming;
  }, [currentHighlightedVerseTiming]);

  return null;
};

const getVerseTimingByVerseKey = (verseKey: string, verseTimings: VerseTiming[]) => {
  return verseTimings.find((verseTiming) => verseTiming.verseKey === verseKey);
};

export default FindAGoodName;
