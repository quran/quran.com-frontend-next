/* eslint-disable react/no-multi-comp */
import { useContext } from 'react';

import { useSelector } from '@xstate/react';
import useTranslation from 'next-translate/useTranslation';

import { getRandomCuratedStationId } from '../Radio/curatedStations';
import { StationType } from '../Radio/types';

import styles from './PlayRadioButton.module.scss';
import RadioInformation from './RadioInformation';

import Button, { ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import Spinner from '@/dls/Spinner/Spinner';
import PauseIcon from '@/icons/pause.svg';
import PlayIcon from '@/icons/play-arrow.svg';
import { logButtonClick } from '@/utils/eventLogger';
import { selectIsLoading } from 'src/xstate/actors/audioPlayer/selectors';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';

const PlayRadioButton = () => {
  const { t } = useTranslation('radio');
  const audioService = useContext(AudioPlayerMachineContext);

  const isAudioPlaying = useSelector(audioService, (state) =>
    state.matches('VISIBLE.AUDIO_PLAYER_INITIATED.PLAYING'),
  );
  const isRadioMode = useSelector(audioService, (state) => !!state.context.radioActor);
  const isLoading = useSelector(audioService, selectIsLoading);

  // TODO: handle continue radio from last saved session
  const onPlayClicked = () => {
    if (isRadioMode) {
      audioService.send('TOGGLE');
      return;
    }
    const randomStationId = getRandomCuratedStationId();

    logButtonClick('play_radio', {
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

  const { radioActor } = audioService.getSnapshot().context;
  return (
    <div className={styles.container}>
      {isAudioPlaying && isRadioMode ? (
        <Button
          prefix={isLoading ? <Spinner /> : <PauseIcon />}
          onClick={onPauseClicked}
          id="radio-button"
          variant={ButtonVariant.Compact}
          size={ButtonSize.Small}
        >
          <p className={styles.listenToRadio}>{t('home:listen-to-radio')}</p>
        </Button>
      ) : (
        <Button
          prefix={<PlayIcon />}
          onClick={onPlayClicked}
          shouldFlipOnRTL={false}
          id="radio-button"
          variant={ButtonVariant.Compact}
          size={ButtonSize.Small}
        >
          <p className={styles.listenToRadio}>{t('home:listen-to-radio')}</p>
        </Button>
      )}
      {radioActor && <RadioInformation radioActor={radioActor} />}
    </div>
  );
};

export default PlayRadioButton;
