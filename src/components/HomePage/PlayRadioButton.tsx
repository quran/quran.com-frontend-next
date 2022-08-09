/* eslint-disable react/no-multi-comp */
import { useContext } from 'react';

import { useActor, useSelector } from '@xstate/react';
import useTranslation from 'next-translate/useTranslation';

import PauseIcon from '../../../public/icons/pause.svg';
import PlayIcon from '../../../public/icons/play-arrow.svg';
import Button from '../dls/Button/Button';
import Link from '../dls/Link/Link';
import Spinner from '../dls/Spinner/Spinner';

import styles from './PlayRadioButton.module.scss';

import { logEvent } from 'src/utils/eventLogger';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';
import { getRandomCuratedStationId } from 'src/xstate/Radio/curatedStations';
import StationType from 'src/xstate/Radio/types/StationType';
import useCurrentStationInfo from 'src/xstate/Radio/useCurrentStationInfo';

const RadioInformation = ({ radioActor }) => {
  const [state] = useActor(radioActor);

  const stationInfo = useCurrentStationInfo((state as any).context);
  const { t } = useTranslation('radio');

  return (
    <div className={styles.stationInfo}>
      <span className={styles.stationTitle}>{stationInfo.title}</span>{' '}
      <Link href="/radio" className={styles.editStationButton}>
        ({t('change')})
      </Link>
    </div>
  );
};

const PlayRadioButton = () => {
  const { t } = useTranslation('radio');
  const audioService = useContext(AudioPlayerMachineContext);

  const isAudioPlaying = useSelector(audioService, (state) =>
    state.matches('VISIBLE.AUDIO_PLAYER_INITIATED.PLAYING'),
  );
  const isRadioMode = useSelector(audioService, (state) => !!state.context.radioActor);
  const isLoading = useSelector(audioService, (state) => state.hasTag('loading'));

  // TODO: handle continue radio from last saved session
  const onPlayClicked = () => {
    if (isRadioMode) {
      audioService.send('TOGGLE');
      return;
    }
    const randomStationId = getRandomCuratedStationId();

    logEvent('play_radio_clicked', {
      stationId: randomStationId,
      type: StationType.Curated,
    });

    audioService.send({
      type: 'PLAY_RADIO',
      stationId: Number(randomStationId),
      stationType: StationType.Curated,
    });
  };

  const onPauseClicked = () => {
    audioService.send('TOGGLE');
  };

  return (
    <div className={styles.container}>
      <div className={styles.playRadioSection}>
        {isAudioPlaying && isRadioMode ? (
          <Button
            prefix={isLoading ? <Spinner /> : <PauseIcon />}
            onClick={onPauseClicked}
            className={styles.playPauseButton}
          >
            {t('pause-radio')}
          </Button>
        ) : (
          <Button
            prefix={<PlayIcon />}
            className={styles.playPauseButton}
            onClick={onPlayClicked}
            shouldFlipOnRTL={false}
          >
            {t('play-radio')}
          </Button>
        )}
        {audioService.getSnapshot().context.radioActor && (
          <RadioInformation radioActor={audioService.getSnapshot().context.radioActor} />
        )}
      </div>
    </div>
  );
};

export default PlayRadioButton;
