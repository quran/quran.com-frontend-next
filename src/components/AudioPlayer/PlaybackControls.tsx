import { useSelector } from 'react-redux';
import { AudioFileStatus, selectAudioFileStatus } from 'src/redux/slices/AudioPlayer/state';
import { withStopPropagation } from 'src/utils/event';

import ForwardIcon from '../../../public/icons/forward_10.svg';
import RepeatIcon from '../../../public/icons/ic_repeat_24px 1.svg';
import ReplayIcon from '../../../public/icons/replay_10.svg';
import Button, { ButtonShape, ButtonSize, ButtonVariant } from '../dls/Button/Button';
import DownloadAudioButton from './DownloadAudioButton';
import { triggerSeek } from './EventTriggers';
import styles from './PlaybackControls.module.scss';
import PlayPauseButton from './PlayPauseButton';

const PlaybackControls = () => {
  const audioFileStatus = useSelector(selectAudioFileStatus);
  const isLoading = audioFileStatus === AudioFileStatus.Loading;

  return (
    <div className={styles.container}>
      <Button
        tooltip="feature coming soon"
        variant={ButtonVariant.Ghost}
        shape={ButtonShape.Circle}
        size={ButtonSize.Large}
      >
        <RepeatIcon />
      </Button>
      <Button
        tooltip="seek -10s"
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
        tooltip="seek +10s"
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
