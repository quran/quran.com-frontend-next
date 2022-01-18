import { useDispatch } from 'react-redux';

import Card, { CardSize } from '../dls/Card/Card';

import curatedStations from './curatedStations';
import styles from './RandomPlaylist.module.scss';
import { CuratedStation, StationState, StationType } from './types';

import { playFrom } from 'src/redux/slices/AudioPlayer/state';
import { setRadioStationState } from 'src/redux/slices/radioStation';

const RandomPlaylist = () => {
  const dispatch = useDispatch();

  const playStation = async (id: string, station: CuratedStation) => {
    const firstAudioItem = curatedStations[id].audioItems[0];
    const stationState: StationState = {
      id,
      type: StationType.Curated,
      title: station.title,
      description: station.description,
      chapterId: firstAudioItem.chapterId,
      reciterId: firstAudioItem.reciterId,
    };
    dispatch(setRadioStationState(stationState));

    dispatch(
      playFrom({
        chapterId: Number(stationState.chapterId),
        reciterId: Number(stationState.reciterId),
        timestamp: 0,
        isRadioMode: true,
      }),
    );
  };

  return (
    <div className={styles.container}>
      {Object.entries(curatedStations).map(([id, station]) => (
        <div className={styles.item} key={id}>
          <Card
            size={CardSize.Large}
            title={station.title}
            description={station.description}
            onClick={() => playStation(id, station)}
          />
        </div>
      ))}
    </div>
  );
};

export default RandomPlaylist;
