import { useCallback, useEffect } from 'react';

import { useDispatch, useSelector, useStore } from 'react-redux';

import stationOperators from './stationOperators';

import { playFrom, selectIsRadioMode } from 'src/redux/slices/AudioPlayer/state';
import { selectRadioStation, setRadioStationState } from 'src/redux/slices/radio';

/**
 * When the current audio player ended,
 * depending on the type of current station (either curated or reciter station),
 * 1) get the next AudioTrack from the station and play it
 * 2) update the radioStation state in redux
 *
 * This function only run when `isRadioMode` is true
 *
 * @param {React.MutableRefObject<HTMLAudioElement>} audioPlayerElRef
 */
const usePlayNextAudioTrackForRadio = (
  audioPlayerElRef: React.MutableRefObject<HTMLAudioElement>,
) => {
  const isRadioMode = useSelector(selectIsRadioMode);

  const store = useStore();
  const dispatch = useDispatch();

  const playNextAudio = useCallback(() => {
    const state = store.getState();
    const currentRadioStationState = selectRadioStation(state);
    const { type } = currentRadioStationState;
    const stationOperator = stationOperators[type];
    const nextAudio = stationOperator.getNextAudio(currentRadioStationState);

    dispatch(
      playFrom({
        chapterId: Number(nextAudio.chapterId),
        reciterId: Number(nextAudio.reciterId),
        timestamp: 0,
        isRadioMode: true,
      }),
    );

    dispatch(
      setRadioStationState({
        ...currentRadioStationState,
        chapterId: nextAudio.chapterId,
        reciterId: nextAudio.reciterId,
      }),
    );
  }, [dispatch, store]);

  useEffect(() => {
    if (!isRadioMode) return null;

    if (audioPlayerElRef.current) {
      const audioPlayerEl = audioPlayerElRef.current;
      audioPlayerEl.addEventListener('ended', playNextAudio);
      return () => {
        audioPlayerEl.removeEventListener('ended', playNextAudio);
      };
    }

    return null;
  }, [audioPlayerElRef, playNextAudio, isRadioMode]);
};

export default usePlayNextAudioTrackForRadio;
