import { useSelector } from 'react-redux';

import ForwardIcon from '../../../public/icons/forward_10.svg';
import ReplayIcon from '../../../public/icons/replay_10.svg';

import PlayPauseButton from './Buttons/PlayPauseButton';
import { triggerSeek } from './EventTriggers';
import OverflowAudioPlayerActionsMenu from './OverflowAudioPlayerActionsMenu';
import styles from './PlaybackControls.module.scss';
import RepeatAudioButton from './RepeatButton';

import Button, { ButtonShape, ButtonVariant } from 'src/components/dls/Button/Button';
import { AudioDataStatus, selectAudioDataStatus } from 'src/redux/slices/AudioPlayer/state';
import { withStopPropagation } from 'src/utils/event';

const PlaybackControls = () => {
  const audioDataStatus = useSelector(selectAudioDataStatus);
  const isLoading = audioDataStatus === AudioDataStatus.Loading;

  return (
    <div className={styles.container}>
      <div className={styles.actionItem}>
        <RepeatAudioButton />
      </div>
      <div className={styles.actionItem}>
        <Button
          tooltip="Rewind 10 seconds"
          variant={ButtonVariant.Ghost}
          shape={ButtonShape.Circle}
          disabled={isLoading}
          onClick={withStopPropagation(() => triggerSeek(-10))}
        >
          <ReplayIcon />
        </Button>
      </div>
      <div className={styles.actionItem}>
        <PlayPauseButton />
      </div>

      <div className={styles.actionItem}>
        <Button
          tooltip="Fast-forward 10 seconds"
          variant={ButtonVariant.Ghost}
          shape={ButtonShape.Circle}
          disabled={isLoading}
          onClick={withStopPropagation(() => triggerSeek(10))}
        >
          <ForwardIcon />
        </Button>
      </div>

      <div className={styles.actionItem}>
        <OverflowAudioPlayerActionsMenu />
      </div>
    </div>
  );
};

export default PlaybackControls;
