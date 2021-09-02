import { shallowEqual, useSelector } from 'react-redux';
import {
  AudioFileStatus,
  selectAudioFileStatus,
  selectAudioPlayerState,
} from 'src/redux/slices/AudioPlayer/state';
import { withStopPropagation } from 'src/utils/event';

import PauseIcon from '../../../public/icons/pause.svg';
import PlayIcon from '../../../public/icons/play-arrow.svg';
import Button, { ButtonShape, ButtonSize, ButtonVariant } from '../dls/Button/Button';
import Spinner, { SpinnerSize } from '../dls/Spinner/Spinner';
import { triggerPauseAudio, triggerPlayAudio } from './EventTriggers';

const PlayPauseButton = () => {
  const { isPlaying } = useSelector(selectAudioPlayerState, shallowEqual);
  const audioFileStatus = useSelector(selectAudioFileStatus);
  const isLoading = audioFileStatus === AudioFileStatus.Loading;

  if (isLoading)
    return (
      <Button
        tooltip="Loading ..."
        size={ButtonSize.Large}
        shape={ButtonShape.Circle}
        variant={ButtonVariant.Ghost}
        onClick={withStopPropagation(triggerPauseAudio)}
      >
        <Spinner size={SpinnerSize.Large} />
      </Button>
    );

  if (isPlaying) {
    return (
      <Button
        tooltip="Pause"
        size={ButtonSize.Large}
        shape={ButtonShape.Circle}
        variant={ButtonVariant.Ghost}
        onClick={withStopPropagation(triggerPauseAudio)}
      >
        <PauseIcon />
      </Button>
    );
  }
  return (
    <Button
      tooltip="Play"
      shape={ButtonShape.Circle}
      size={ButtonSize.Large}
      variant={ButtonVariant.Ghost}
      onClick={withStopPropagation(triggerPlayAudio)}
    >
      <PlayIcon />
    </Button>
  );
};

export default PlayPauseButton;
