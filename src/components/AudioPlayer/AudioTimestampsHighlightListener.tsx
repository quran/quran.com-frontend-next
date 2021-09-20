import { useEffect, useRef } from 'react';

import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import useSWRImmutable from 'swr/immutable';

import getHighlightedLocation from './getHighlightedLocation';

import { getAudioFile } from 'src/api';
import { selectAudioPlayerState } from 'src/redux/slices/AudioPlayer/state';
import {
  initialState as defaultHighlightStatus,
  setHighlightedLocation,
} from 'src/redux/slices/QuranReader/highlightedLocation';
import { makeAudioFilesUrl } from 'src/utils/apiPaths';

type AudioTimestampsHighlightListenerProps = {
  reciterId: number;
  chapterId: number;
};

/**
 * Listen to audio player's currentTime and update highlightedLocation state
 *
 * @returns {void}
 */
const HighlightedLocationUpdater = ({
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
    const highlightStatus = getHighlightedLocation(
      window.audioPlayerEl.currentTime * 1000, // convert currentTime to milliseconds
      data.verseTimings,
    );

    // only update redux value if current highlight value does not equal prev value
    if (!shallowEqual(highlightStatus, lastHighlightStatus.current)) {
      dispatch(setHighlightedLocation(highlightStatus));
      lastHighlightStatus.current = highlightStatus;
    }
  }, [data, dispatch, currentTime]);

  return null;
};

export default HighlightedLocationUpdater;
