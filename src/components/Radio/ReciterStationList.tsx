import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import PauseIcon from '../../../public/icons/pause.svg';
import PlayIcon from '../../../public/icons/play-arrow.svg';
import { triggerPauseAudio, triggerPlayAudio } from '../AudioPlayer/EventTriggers';
import DataFetcher from '../DataFetcher';
import Card, { CardSize } from '../dls/Card/Card';

import styles from './ReciterStationList.module.scss';
import { StationState, StationType } from './types';

import { getImageCDNPath } from 'src/api';
import { playFrom, selectIsPlaying } from 'src/redux/slices/AudioPlayer/state';
import { selectRadioStation, setRadioStationState } from 'src/redux/slices/radio';
import { makeRecitersUrl } from 'src/utils/apiPaths';
import { getRandomChapterId } from 'src/utils/chapter';
import { logEvent } from 'src/utils/eventLogger';
import { RecitersResponse } from 'types/ApiResponses';
import Reciter from 'types/Reciter';

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
      queryKey={makeRecitersUrl(lang, ['profile_picture'])}
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
                  imgSrc={getImageCDNPath(reciter.profilePicture)}
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
