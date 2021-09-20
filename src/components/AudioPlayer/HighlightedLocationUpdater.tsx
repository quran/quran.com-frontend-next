import { useEffect, useRef } from 'react';

import { shallowEqual, useDispatch } from 'react-redux';
import useSWRImmutable from 'swr/immutable';

import getHighlightedLocation from './getHighlightedLocation';

import { getChapterAudioFile } from 'src/api';
import {
  initialState as defaultHighlightedLocation,
  setHighlightedLocation,
} from 'src/redux/slices/QuranReader/highlightedLocation';
import { makeChapterAudioFiles } from 'src/utils/apiPaths';

type AudioTimestampsHighlightListenerProps = {
  reciterId: number;
  chapterId: number;
  currentTime: number;
};

/**
 * Listen to audio player's currentTime and update highlightedLocation state
 *
 * @returns {void}
 */
const HighlightedLocationUpdater = ({
  reciterId,
  chapterId,
  currentTime,
}: AudioTimestampsHighlightListenerProps) => {
  const dispatch = useDispatch();
  const { data } = useSWRImmutable(makeChapterAudioFiles(reciterId, chapterId, true), () =>
    getChapterAudioFile(reciterId, chapterId, true),
  );

  const lastHighlightedLocation = useRef(defaultHighlightedLocation);

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (!data) return;

    const highlightStatus = getHighlightedLocation(
      window.audioPlayerEl.currentTime * 1000, // convert currentTime to milliseconds
      data.verseTimings,
    );

    // only update redux value if current highlight value does not equal prev value
    if (!shallowEqual(highlightStatus, lastHighlightedLocation.current)) {
      dispatch(setHighlightedLocation(highlightStatus));
      lastHighlightedLocation.current = highlightStatus;
    }
  }, [data, dispatch, currentTime]);

  return null;
};

export default HighlightedLocationUpdater;
