import sample from 'lodash/sample';
import { useDispatch } from 'react-redux';

import PlayIcon from '../../../public/icons/play-arrow.svg';
import Card, { CardSize } from '../dls/Card/Card';

import styles from './CuratedStationList.module.scss';
import curatedStations from './curatedStations';
import { CuratedStation, StationState, StationType } from './types';

import { playFrom } from 'src/redux/slices/AudioPlayer/state';
import { setRadioStationState } from 'src/redux/slices/radioStation';
import { logEvent } from 'src/utils/eventLogger';

const RandomPlaylist = () => {
  const dispatch = useDispatch();

  const playStation = async (id: string, station: CuratedStation) => {
    logEvent('station_played', {
      stationId: id,
      type: StationType.Curated,
    });

    const randomAudioItem = sample(curatedStations[id].audioItems);
    const nextStationState: StationState = {
      id,
      type: StationType.Curated,
      title: station.title,
      description: station.description,
      chapterId: randomAudioItem.chapterId,
      reciterId: randomAudioItem.reciterId,
    };
    dispatch(setRadioStationState(nextStationState));

    dispatch(
      playFrom({
        chapterId: Number(nextStationState.chapterId),
        reciterId: Number(nextStationState.reciterId),
        shouldUseRandomTimestamp: true,
        isRadioMode: true,
      }),
    );
  };

  return (
    <div className={styles.container}>
      {Object.entries(curatedStations).map(([id, station]) => (
        <div className={styles.item} key={id}>
          <Card
            actionIcon={<PlayIcon />}
            imgSrc={station.bannerImgSrc}
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
