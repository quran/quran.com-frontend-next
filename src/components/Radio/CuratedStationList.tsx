import sample from 'lodash/sample';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';

import PauseIcon from '../../../public/icons/pause.svg';
import PlayIcon from '../../../public/icons/play-arrow.svg';
import Card, { CardSize } from '../dls/Card/Card';

import styles from './CuratedStationList.module.scss';
import curatedStations from './curatedStations';
import { CuratedStation, StationState, StationType } from './types';

import { playFrom } from 'src/redux/slices/AudioPlayer/state';
import { selectRadioStation, setRadioStationState } from 'src/redux/slices/radio';
import { logEvent } from 'src/utils/eventLogger';

// When one of the curated station is clicked,
// 1) Pick (randomly) one of the audioTrack listen in the station
//    the listen can be found in curatadStations.ts
// 2) Update the current station state in the redux
// 3) Play the audio
const CuratedStationList = () => {
  const dispatch = useDispatch();
  const stationState = useSelector(selectRadioStation, shallowEqual);

  const playStation = async (id: string, station: CuratedStation) => {
    logEvent('station_played', {
      stationId: id,
      type: StationType.Curated,
    });

    const randomAudioTrack = sample(curatedStations[id].audioTracks);
    const nextStationState: StationState = {
      id,
      type: StationType.Curated,
      title: station.title,
      description: station.description,
      chapterId: randomAudioTrack.chapterId,
      reciterId: randomAudioTrack.reciterId,
    };
    dispatch(setRadioStationState(nextStationState));

    dispatch(
      playFrom({
        chapterId: Number(nextStationState.chapterId),
        reciterId: Number(nextStationState.reciterId),
        shouldStartFromRandomTimestamp: true,
        isRadioMode: true,
      }),
    );
  };

  return (
    <div className={styles.container}>
      {Object.entries(curatedStations).map(([id, station]) => {
        const isSelectedStation =
          stationState.type === StationType.Curated && stationState.id === id;
        return (
          <div className={styles.item} key={id}>
            <Card
              actionIcon={isSelectedStation ? <PauseIcon /> : <PlayIcon />}
              imgSrc={station.bannerImgSrc}
              size={CardSize.Large}
              title={station.title}
              description={station.description}
              onClick={() => playStation(id, station)}
            />
          </div>
        );
      })}
    </div>
  );
};

export default CuratedStationList;
