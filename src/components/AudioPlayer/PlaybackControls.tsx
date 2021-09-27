import { useSelector } from 'react-redux';

import ForwardIcon from '../../../public/icons/forward_10.svg';
import ReplayIcon from '../../../public/icons/replay_10.svg';

import CloseButton from './Buttons/CloseButton';
import PlayPauseButton from './Buttons/PlayPauseButton';
import { triggerSeek } from './EventTriggers';
import styles from './PlaybackControls.module.scss';
import RepeatButton from './RepeatButton';

import Button, { ButtonShape, ButtonVariant } from 'src/components/dls/Button/Button';
import { AudioFileStatus, selectAudioFileStatus } from 'src/redux/slices/AudioPlayer/state';
import { withStopPropagation } from 'src/utils/event';

const PlaybackControls = () => {
  const audioFileStatus = useSelector(selectAudioFileStatus);
  const isLoading = audioFileStatus === AudioFileStatus.Loading;

  return (
    <div className={styles.container}>
      <RepeatButton />
      <Button
        tooltip="Rewind 10 seconds"
        variant={ButtonVariant.Ghost}
        shape={ButtonShape.Circle}
        disabled={isLoading}
        onClick={withStopPropagation(() => triggerSeek(-10))}
      >
        <ReplayIcon />
      </Button>
      <PlayPauseButton />
      <Button
        tooltip="Fast-forward 10 seconds"
        variant={ButtonVariant.Ghost}
        shape={ButtonShape.Circle}
        disabled={isLoading}
        onClick={withStopPropagation(() => triggerSeek(10))}
      >
        <ForwardIcon />
      </Button>
      <CloseButton />
    </div>
  );
};

export default PlaybackControls;
