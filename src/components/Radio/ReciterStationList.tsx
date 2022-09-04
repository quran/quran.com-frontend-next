import { useContext } from 'react';

import { useSelector } from '@xstate/react';

import Card, { CardSize } from '../dls/Card/Card';
import Link from '../dls/Link/Link';

import styles from './ReciterStationList.module.scss';
import { StationType } from './types';

import PauseIcon from '@/icons/pause.svg';
import PlayIcon from '@/icons/play-arrow.svg';
import { makeCDNUrl } from '@/utils/cdn';
import { logEvent } from '@/utils/eventLogger';
import { getReciterNavigationUrl } from '@/utils/navigation';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';
import Reciter from 'types/Reciter';

type ReciterStationListProps = {
  reciters: Reciter[];
};
const ReciterStationList = ({ reciters }: ReciterStationListProps) => {
  const audioService = useContext(AudioPlayerMachineContext);
  const isAudioPlaying = useSelector(audioService, (state) =>
    state.matches('VISIBLE.AUDIO_PLAYER_INITIATED.PLAYING'),
  );

  const radioActor = useSelector(audioService, (state) => state.context.radioActor);
  const radioContext = radioActor?.getSnapshot()?.context || {};

  return (
    <div className={styles.container}>
      {reciters.map((reciter) => {
        const isSelectedStation =
          radioContext.type === StationType.Reciter && Number(radioContext.id) === reciter.id;

        let onClick;
        if (!isSelectedStation) {
          onClick = () => {
            logEvent('station_played', {
              stationId: reciter.id,
              type: StationType.Curated,
            });
            audioService.send({
              type: 'PLAY_RADIO',
              stationType: StationType.Reciter,
              stationId: reciter.id,
            });
          };
        }
        if (isSelectedStation) {
          onClick = () => audioService.send('TOGGLE');
        }

        const actionIcon = isSelectedStation && isAudioPlaying ? <PauseIcon /> : <PlayIcon />;
        return (
          <Card
            actionIcon={actionIcon}
            imgSrc={makeCDNUrl(reciter.profilePicture)}
            key={reciter.id}
            onImgClick={onClick}
            title={
              <Link key={reciter.id} href={getReciterNavigationUrl(reciter.id.toString())}>
                {reciter.translatedName.name}
              </Link>
            }
            imgAlt={reciter.translatedName.name}
            description={reciter.style.name}
            size={CardSize.Medium}
          />
        );
      })}
    </div>
  );
};

export default ReciterStationList;
