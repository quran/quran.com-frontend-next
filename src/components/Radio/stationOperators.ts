import curatedStations from './curatedStations';
import { StationOperator, StationState, StationType } from './types';

import { QURAN_CHAPTERS_COUNT } from 'src/utils/chapter';

const curatedStationOperator: StationOperator = {
  /**
   * Given current chapterId, reciterId, and stationId from current stationState,
   * return the next audio track from the station
   *
   * If the the current audio track is the last one in the station,
   * return the first audio track in the station
   *
   * @param {StationState} stationState
   * @returns {AudioTrack} next audio track
   */
  getNextAudioTrack: (stationState: StationState) => {
    const currentChapterId = stationState.chapterId;
    const currentReciterId = stationState.reciterId;
    const stationId = stationState.id;

    const station = curatedStations[stationId];
    const currentAudioIndex = station.audioTracks.findIndex(
      ({ chapterId, reciterId }) =>
        chapterId === currentChapterId && reciterId === currentReciterId,
    );

    const nextAudioIndex =
      currentAudioIndex >= station.audioTracks.length - 1 ? 0 : currentAudioIndex + 1;

    const nextAudio = station.audioTracks[nextAudioIndex];

    return { chapterId: nextAudio.chapterId, reciterId: nextAudio.reciterId };
  },
};

const reciterStationOperator: StationOperator = {
  /**
   * Given the current chapterId and reciterId from current stationState
   * get the next chapter / surah for this reciter
   *
   * If the current chapter is the last chapter of the Quran.
   * go back to chapter 1
   *
   * @param {StationState} stationState
   * @returns {AudioTrack} next audio track
   */
  getNextAudioTrack: ({ chapterId, reciterId }: StationState) => {
    const nextReciterId = reciterId;
    const nextChapterId = Number(chapterId) >= QURAN_CHAPTERS_COUNT ? 1 : Number(chapterId) + 1;
    return { reciterId: nextReciterId, chapterId: nextChapterId.toString() };
  },
};

/**
 * Station Operator based on the type of station,
 * each of them will have different behavior, but same interface
 *
 * For example reciter station will just play chapter when the audio ended.
 * So we don't need data source for reciter station.
 *
 * But for curated station, we get the next audio based on the data listed in curatedStations.ts
 *
 */
const stationOperators = {
  [StationType.Curated]: curatedStationOperator,
  [StationType.Reciter]: reciterStationOperator,
};

export default stationOperators;
