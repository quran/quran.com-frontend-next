import { useSelector } from 'react-redux';

import ForwardIcon from '../../../public/icons/forward_10.svg';
import RepeatIcon from '../../../public/icons/ic_repeat_24px 1.svg';
import ReplayIcon from '../../../public/icons/replay_10.svg';

import DownloadAudioButton from './DownloadAudioButton';
import { triggerSeek } from './EventTriggers';
import styles from './PlaybackControls.module.scss';
import PlayPauseButton from './PlayPauseButton';

import Button, { ButtonShape, ButtonSize, ButtonVariant } from 'src/components/dls/Button/Button';
import { AudioFileStatus, selectAudioFileStatus } from 'src/redux/slices/AudioPlayer/state';
import { withStopPropagation } from 'src/utils/event';

const PlaybackControls = () => {
  const audioFileStatus = useSelector(selectAudioFileStatus);
  const isLoading = audioFileStatus === AudioFileStatus.Loading;

  return (
    <div className={styles.container}>
      <Button
        tooltip="Feature coming soon"
        variant={ButtonVariant.Ghost}
        shape={ButtonShape.Circle}
        size={ButtonSize.Large}
        disabled
      >
        <RepeatIcon />
      </Button>
      <Button
        tooltip="Rewind 10 seconds"
        variant={ButtonVariant.Ghost}
        shape={ButtonShape.Circle}
        size={ButtonSize.Large}
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
        size={ButtonSize.Large}
        disabled={isLoading}
        onClick={withStopPropagation(() => triggerSeek(10))}
      >
        <ForwardIcon />
      </Button>
      <DownloadAudioButton />
    </div>
  );
};

export default PlaybackControls;
