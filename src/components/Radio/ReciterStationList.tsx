import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import PauseIcon from '../../../public/icons/pause.svg';
import PlayIcon from '../../../public/icons/play-arrow.svg';
import { triggerPauseAudio, triggerPlayAudio } from '../AudioPlayer/EventTriggers';
import DataFetcher from '../DataFetcher';
import Card, { CardSize } from '../dls/Card/Card';

import styles from './ReciterStationList.module.scss';
import { StationState, StationType } from './types';

import { playFrom, selectIsPlaying } from 'src/redux/slices/AudioPlayer/state';
import { selectRadioStation, setRadioStationState } from 'src/redux/slices/radio';
import { makeRecitersUrl } from 'src/utils/apiPaths';
import { getRandomChapterId } from 'src/utils/chapter';
import { logEvent } from 'src/utils/eventLogger';
import { RecitersResponse } from 'types/ApiResponses';
import Reciter from 'types/Reciter';

// TODO:
// - these images url should come from backend.
// - find better images
export const reciterPictures = {
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

const ReciterStationList = () => {
  const dispatch = useDispatch();
  const { lang } = useTranslation();
  const stationState = useSelector(selectRadioStation, shallowEqual);
  const isAudioPlaying = useSelector(selectIsPlaying);

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
        shouldStartFromRandomTimestamp: true,
        isRadioMode: true,
      }),
    );
  };

  return (
    <DataFetcher
      queryKey={makeRecitersUrl(lang)}
      render={(data: RecitersResponse) => {
        if (!data) return null;
        return (
          <div className={styles.container}>
            {data.reciters.map((reciter) => {
              const isSelectedStation =
                stationState.type === StationType.Reciter && Number(stationState.id) === reciter.id;

              let onClick;
              if (!isSelectedStation) onClick = () => playReciterStation(reciter);
              if (isSelectedStation && isAudioPlaying) onClick = () => triggerPauseAudio();
              if (isSelectedStation && !isAudioPlaying) onClick = () => triggerPlayAudio();

              const actionIcon = isSelectedStation && isAudioPlaying ? <PauseIcon /> : <PlayIcon />;
              return (
                <Card
                  actionIcon={actionIcon}
                  imgSrc={reciterPictures[reciter.id]}
                  key={reciter.id}
                  onClick={onClick}
                  title={reciter.name}
                  description={reciter.style.name}
                  size={CardSize.Medium}
                />
              );
            })}
          </div>
        );
      }}
    />
  );
};

export default ReciterStationList;
