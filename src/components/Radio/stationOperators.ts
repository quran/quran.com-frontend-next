import curatedStations from './curatedStations';
import { StationOperator, StationState, StationType } from './types';

const curatedStationOperator: StationOperator = {
  getNextAudio: (stationState: StationState) => {
    const currentChapterId = stationState.chapterId;
    const currentReciterId = stationState.reciterId;
    const stationId = stationState.id;

    const station = curatedStations[stationId];
    const currentAudioIndex = station.audioItems.findIndex(
      ({ chapterId, reciterId }) =>
        chapterId === currentChapterId && reciterId === currentReciterId,
    );

    const nextAudioIndex =
      currentAudioIndex >= station.audioItems.length - 1 ? 0 : currentAudioIndex + 1;

    const nextAudio = station.audioItems[nextAudioIndex];

    return { chapterId: nextAudio.chapterId, reciterId: nextAudio.reciterId };
  },
};

const reciterStationOperator: StationOperator = {
  getNextAudio: ({ chapterId, reciterId }: StationState) => {
    const nextReciterId = reciterId;
    const nextChapterId = Number(chapterId) >= 114 ? 1 : Number(chapterId) + 1;
    return { reciterId: nextReciterId, chapterId: nextChapterId.toString() };
  },
};

const stationOperators = {
  [StationType.Curated]: curatedStationOperator,
  [StationType.Reciter]: reciterStationOperator,
};

export default stationOperators;
