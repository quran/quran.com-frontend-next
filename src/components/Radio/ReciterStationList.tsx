import { useDispatch } from 'react-redux';

import PlayIcon from '../../../public/icons/play-arrow.svg';
import DataFetcher from '../DataFetcher';
import Card, { CardSize } from '../dls/Card/Card';

import styles from './ReciterStationList.module.scss';
import { StationState, StationType } from './types';

import { playFrom } from 'src/redux/slices/AudioPlayer/state';
import { setRadioStationState } from 'src/redux/slices/radioStation';
import { makeRecitersUrl } from 'src/utils/apiPaths';
import { getRandomChapterId } from 'src/utils/chapter';
import { logEvent } from 'src/utils/eventLogger';
import { RecitersResponse } from 'types/ApiResponses';
import Reciter from 'types/Reciter';

// TODO:
// - these images url should come from backend.
// - find better images
const reciterPictures = {
  1: '/images/reciters/1.jpg',
  2: '/images/reciters/2.jpeg',
  3: '/images/reciters/3.jpeg',
  4: '/images/reciters/4.jpg',
  5: '/images/reciters/5.jpg',
  6: '/images/reciters/6.jpg',
  7: '/images/reciters/7.jpg',
  9: '/images/reciters/9.jpg',
  10: '/images/reciters/10.jpg',
  161: '/images/reciters/161.jpg',
  12: '/images/reciters/12.jpg',
};

const ReciterList = () => {
  const dispatch = useDispatch();

  const playReciterStation = async (reciter: Reciter) => {
    logEvent('station_played', {
      stationId: reciter.id,
      type: StationType.Curated,
    });

    const nextStationState: StationState = {
      id: reciter.id.toString(),
      type: StationType.Reciter,
      title: reciter.name,
      description: reciter.style.name,
      chapterId: getRandomChapterId().toString(),
      reciterId: reciter.id.toString(),
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
    <DataFetcher
      queryKey={makeRecitersUrl()}
      render={(data: RecitersResponse) => {
        if (!data) return null;
        return (
          <div className={styles.container}>
            {data.reciters.map((reciter) => (
              <Card
                actionIcon={<PlayIcon />}
                imgSrc={reciterPictures[reciter.id]}
                key={reciter.id}
                onClick={() => playReciterStation(reciter)}
                title={reciter.name}
                description={reciter.style.name}
                size={CardSize.Medium}
              />
            ))}
          </div>
        );
      }}
    />
  );
};

export default ReciterList;
