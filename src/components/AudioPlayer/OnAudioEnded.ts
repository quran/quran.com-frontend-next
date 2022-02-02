import { useCallback } from 'react';

import { useDispatch, useStore } from 'react-redux';

import stationOperators from '../Radio/stationOperators';

import { RootState } from 'src/redux/RootState';
import { playFrom, selectIsRadioMode } from 'src/redux/slices/AudioPlayer/state';
import { selectRadioStation, setRadioStationState } from 'src/redux/slices/radio';
import { QURAN_CHAPTERS_COUNT } from 'src/utils/chapter';

const useOnAudioEnded = () => {
  const store = useStore();
  const dispatch = useDispatch();

  /**
   * When in Radio mode, depending on the type of current station (either curated or reciter station),
   * 1) get the next AudioTrack from the station and play it
   * 2) update the radioStation state in redux
   */
  const playNextRadioAudioTrack = useCallback(() => {
    const state: RootState = store.getState();
    const currentRadioStationState = selectRadioStation(state);
    const { type } = currentRadioStationState;
    const stationOperator = stationOperators[type];
    const nextAudio = stationOperator.getNextAudioTrack(currentRadioStationState);

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

  /**
   * When not in radio mode, play the next chapter with current selected reciter
   */
  const playNextChapter = useCallback(() => {
    const state: RootState = store.getState();
    const { chapterId } = state.audioPlayerState.audioData;
    const reciterId = state.audioPlayerState.reciter.id;
    const nextChapterId = chapterId === QURAN_CHAPTERS_COUNT ? 1 : chapterId + 1;

    playFrom({
      chapterId: nextChapterId,
      reciterId,
      timestamp: 0,
    });
  }, [store]);

  const callback = useCallback(() => {
    const state: RootState = store.getState();
    const isRadioMode = selectIsRadioMode(state);

    if (isRadioMode) {
      playNextRadioAudioTrack();
    } else {
      playNextChapter();
    }

    return callback;
  }, [playNextChapter, playNextRadioAudioTrack, store]);
};

export default useOnAudioEnded;
