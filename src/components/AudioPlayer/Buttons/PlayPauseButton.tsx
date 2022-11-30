import { useContext } from 'react';

import { useSelector } from '@xstate/react';
import useTranslation from 'next-translate/useTranslation';

import Button, { ButtonShape, ButtonVariant } from '@/dls/Button/Button';
import Spinner, { SpinnerSize } from '@/dls/Spinner/Spinner';
import PauseIcon from '@/icons/pause.svg';
import PlayIcon from '@/icons/play-arrow.svg';
import { withStopPropagation } from '@/utils/event';
import { logButtonClick } from '@/utils/eventLogger';
import { selectIsLoading } from 'src/xstate/actors/audioPlayer/selectors';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';

const PlayPauseButton = () => {
  const { t } = useTranslation('common');

  const audioService = useContext(AudioPlayerMachineContext);

  const isPlaying = useSelector(audioService, (state) =>
    state.matches('VISIBLE.AUDIO_PLAYER_INITIATED.PLAYING'),
  );
  const isLoading = useSelector(audioService, selectIsLoading);

  if (isLoading) {
    return (
      <Button
        tooltip={`${t('loading')}...`}
        shape={ButtonShape.Circle}
        variant={ButtonVariant.Ghost}
        isDisabled={isLoading}
      >
        <Spinner size={SpinnerSize.Large} />
      </Button>
    );
  }
  if (isPlaying) {
    return (
      <Button
        tooltip={t('audio.player.pause')}
        shape={ButtonShape.Circle}
        variant={ButtonVariant.Ghost}
        onClick={withStopPropagation(() => {
          logButtonClick('audio_player_pause');
          audioService.send('TOGGLE');
        })}
      >
        <PauseIcon />
      </Button>
    );
  }
  return (
    <Button
      tooltip={t('audio.player.play')}
      shape={ButtonShape.Circle}
      variant={ButtonVariant.Ghost}
      onClick={withStopPropagation(() => {
        logButtonClick('audio_player_play');
        audioService.send('TOGGLE');
      })}
      shouldFlipOnRTL={false}
    >
      <PlayIcon />
    </Button>
  );
};

export default PlayPauseButton;
