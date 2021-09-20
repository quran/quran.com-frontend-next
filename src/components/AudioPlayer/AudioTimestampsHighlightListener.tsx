import { useEffect, useRef } from 'react';

import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import useSWRImmutable from 'swr/immutable';

import { getAudioFile } from 'src/api';
import { selectAudioPlayerState } from 'src/redux/slices/AudioPlayer/state';
import {
  HighlightStatusState,
  setHighlightStatus,
  initialState as defaultHighlightStatus,
} from 'src/redux/slices/QuranReader/highlightStatus';
import { makeAudioFilesUrl } from 'src/utils/apiPaths';
import { getVerseAndChapterNumbersFromKey } from 'src/utils/verse';
import VerseTiming from 'types/VerseTiming';

type AudioTimestampsHighlightListenerProps = {
  reciterId: number;
  chapterId: number;
};

const AudioTimestampsHighlightListener = ({
  reciterId,
  chapterId,
}: AudioTimestampsHighlightListenerProps) => {
  const dispatch = useDispatch();
  const { data } = useSWRImmutable(makeAudioFilesUrl(reciterId, chapterId, true), () =>
    getAudioFile(reciterId, chapterId, true),
  );
  const { currentTime } = useSelector(selectAudioPlayerState, shallowEqual);

  const lastHighlightStatus = useRef(defaultHighlightStatus);

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (!data) return null;
    const highlightStatus = getHighlightStatus(
      window.audioPlayerEl.currentTime * 1000, // convert currentTime to milliseconds
      data.verseTimings,
    );

    // only update redux value if current highlight value does not equal prev value
    if (!shallowEqual(highlightStatus, lastHighlightStatus.current)) {
      dispatch(setHighlightStatus(highlightStatus));
      lastHighlightStatus.current = highlightStatus;
    }
  }, [data, dispatch, currentTime]);

  return null;
};

/**
 * given the current time of the audio player and the verse timings,
 * determine which `chapter`, `verse`, and `word` should currently be highlighted
 *
 * @param {number} currentTime
 * @param {VerseTiming[]} verseTimings
 * @returns {HighlightStatusState} highlightStatus
 */
const getHighlightStatus = (
  currentTime: number,
  verseTimings: VerseTiming[],
): HighlightStatusState => {
  const selectedVerse = verseTimings.find(
    (verse) => currentTime >= verse.timestampFrom && currentTime <= verse.timestampTo,
  );

  if (!selectedVerse) return defaultHighlightStatus;
  const selectedWord = selectedVerse.segments.find((segment) => {
    const [, timestampFrom, timestampTo] = segment;
    return currentTime >= timestampFrom && currentTime <= timestampTo;
  });

  if (!selectedWord) return defaultHighlightStatus;

  const [chapter, verse] = getVerseAndChapterNumbersFromKey(selectedVerse.verseKey);
  const [word] = selectedWord;
  return {
    chapter: Number(chapter),
    verse: Number(verse),
    word,
  };
};

export default AudioTimestampsHighlightListener;
