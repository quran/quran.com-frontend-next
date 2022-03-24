import { Dispatch } from '@reduxjs/toolkit';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import PauseIcon from '../../../public/icons/pause.svg';
import PlayIcon from '../../../public/icons/play-arrow.svg';
import { triggerPauseAudio, triggerPlayAudio } from '../AudioPlayer/EventTriggers';
import Card, { CardSize } from '../dls/Card/Card';

import styles from './ReciterStationList.module.scss';
import { StationState, StationType } from './types';

import { playFrom, selectIsPlaying } from 'src/redux/slices/AudioPlayer/state';
import { selectRadioStation, setRadioStationState } from 'src/redux/slices/radio';
import { makeCDNUrl } from 'src/utils/cdn';
import { getRandomChapterId } from 'src/utils/chapter';
import { logEvent } from 'src/utils/eventLogger';
import Reciter from 'types/Reciter';

export const playReciterStation = async (reciter: Reciter, dispatch: Dispatch<any>) => {
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

type ReciterStationListProps = {
  reciters: Reciter[];
};
const ReciterStationList = ({ reciters }: ReciterStationListProps) => {
  const dispatch = useDispatch();
  const stationState = useSelector(selectRadioStation, shallowEqual);
  const isAudioPlaying = useSelector(selectIsPlaying);

  return (
    <div className={styles.container}>
      {reciters.map((reciter) => {
        const isSelectedStation =
          stationState.type === StationType.Reciter && Number(stationState.id) === reciter.id;

        let onClick;
        if (!isSelectedStation)
          onClick = () => {
            logEvent('station_played', {
              stationId: reciter.id,
              type: StationType.Curated,
            });
            playReciterStation(reciter, dispatch);
          };
        if (isSelectedStation && isAudioPlaying) onClick = () => triggerPauseAudio();
        if (isSelectedStation && !isAudioPlaying) onClick = () => triggerPlayAudio();

        const actionIcon = isSelectedStation && isAudioPlaying ? <PauseIcon /> : <PlayIcon />;
        return (
          <Card
            actionIcon={actionIcon}
            imgSrc={makeCDNUrl(reciter.profilePicture)}
            key={reciter.id}
            onImgClick={onClick}
            title={reciter.translatedName.name}
            description={reciter.style.name}
            size={CardSize.Medium}
          />
        );
      })}
    </div>
  );
};

export default ReciterStationList;
