import { useContext } from 'react';

import { useActor } from '@xstate/react';

import PauseIcon from '../../../public/icons/pause.svg';
import PlayIcon from '../../../public/icons/play-arrow.svg';
import Card, { CardSize } from '../dls/Card/Card';

import styles from './ReciterStationList.module.scss';

import { makeCDNUrl } from 'src/utils/cdn';
import { logEvent } from 'src/utils/eventLogger';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';
import StationType from 'src/xstate/Radio/types/StationType';
import Reciter from 'types/Reciter';

type ReciterStationListProps = {
  reciters: Reciter[];
};
const ReciterStationList = ({ reciters }: ReciterStationListProps) => {
  const audioService = useContext(AudioPlayerMachineContext);
  const [state, send] = useActor(audioService);

  const radioContext = state.context?.radioActor?.getSnapshot()?.context || {};
  const isAudioPlaying = state.matches('VISIBLE.AUDIO_PLAYER_INITIATED.PLAYING');

  return (
    <div className={styles.container}>
      {reciters.map((reciter) => {
        const isSelectedStation =
          radioContext.type === StationType.Reciter && Number(radioContext.id) === reciter.id;

        let onClick;
        if (!isSelectedStation)
          onClick = () => {
            logEvent('station_played', {
              stationId: reciter.id,
              type: StationType.Curated,
            });
            send({ type: 'PLAY_RADIO', stationType: StationType.Reciter, stationId: reciter.id });
          };
        if (isSelectedStation && isAudioPlaying) onClick = () => send('TOGGLE');
        if (isSelectedStation && !isAudioPlaying) onClick = () => send('TOGGLE');

        const actionIcon = isSelectedStation && isAudioPlaying ? <PauseIcon /> : <PlayIcon />;
        return (
          <Card
            actionIcon={actionIcon}
            imgSrc={makeCDNUrl(reciter.profilePicture)}
            key={reciter.id}
            onImgClick={onClick}
            title={reciter.translatedName.name}
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
