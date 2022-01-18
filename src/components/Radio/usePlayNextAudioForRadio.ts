import { useCallback, useEffect } from 'react';

import { useDispatch, useStore } from 'react-redux';

import stationOperators from './stationOperators';

import { playFrom } from 'src/redux/slices/AudioPlayer/state';
import { selectRadioStation, setRadioStationState } from 'src/redux/slices/radioStation';

const usePlayNextAudioForRadio = (audioPlayerElRef: React.MutableRefObject<HTMLAudioElement>) => {
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
    if (audioPlayerElRef.current) {
      const audioPlayerEl = audioPlayerElRef.current;
      audioPlayerEl.addEventListener('ended', playNextAudio);
      return () => {
        audioPlayerEl.removeEventListener('ended', playNextAudio);
      };
    }

    return null;
  }, [audioPlayerElRef, playNextAudio]);
};

export default usePlayNextAudioForRadio;
