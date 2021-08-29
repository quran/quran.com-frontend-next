import { withStopPropagation } from 'src/utils/event';

import ForwardIcon from '../../../public/icons/forward_10.svg';
import RepeatIcon from '../../../public/icons/ic_repeat_24px 1.svg';
import ReplayIcon from '../../../public/icons/replay_10.svg';
import Button, { ButtonShape, ButtonSize, ButtonVariant } from '../dls/Button/Button';
import DownloadAudioButton from './DownloadAudioButton';
import { triggerSeek } from './EventTriggers';
import styles from './PlaybackControls.module.scss';
import PlayPauseButton from './PlayPauseButton';

const PlaybackControls = () => (
  <div className={styles.container}>
    <Button variant={ButtonVariant.Ghost} shape={ButtonShape.Circle} size={ButtonSize.Large}>
      <RepeatIcon />
    </Button>
    <Button
      variant={ButtonVariant.Ghost}
      shape={ButtonShape.Circle}
      size={ButtonSize.Large}
      onClick={withStopPropagation(() => triggerSeek(-10))}
    >
      <ReplayIcon />
    </Button>
    <PlayPauseButton />
    <Button
      variant={ButtonVariant.Ghost}
      shape={ButtonShape.Circle}
      size={ButtonSize.Large}
      onClick={withStopPropagation(() => triggerSeek(10))}
    >
      <ForwardIcon />
    </Button>
    <DownloadAudioButton />
  </div>
);

export default PlaybackControls;
