import sample from 'lodash/sample';
import { useDispatch } from 'react-redux';

import PlayIcon from '../../../public/icons/play-arrow.svg';
import Card, { CardSize } from '../dls/Card/Card';

import curatedStations from './curatedStations';
import styles from './RandomPlaylist.module.scss';
import { CuratedStation, StationState, StationType } from './types';

import { playFrom } from 'src/redux/slices/AudioPlayer/state';
import { setRadioStationState } from 'src/redux/slices/radioStation';

const RandomPlaylist = () => {
  const dispatch = useDispatch();

  const playStation = async (id: string, station: CuratedStation) => {
    const randomAudioItem = sample(curatedStations[id].audioItems);
    const stationState: StationState = {
      id,
      type: StationType.Curated,
      title: station.title,
      description: station.description,
      chapterId: randomAudioItem.chapterId,
      reciterId: randomAudioItem.reciterId,
    };
    dispatch(setRadioStationState(stationState));

    dispatch(
      playFrom({
        chapterId: Number(stationState.chapterId),
        reciterId: Number(stationState.reciterId),
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
            hoverIcon={<PlayIcon />}
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
