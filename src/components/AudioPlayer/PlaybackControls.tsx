import { useSelector } from 'react-redux';
import { selectIsPlaying } from 'src/redux/slices/AudioPlayer/state';
import { withStopPropagation } from 'src/utils/event';
import styles from './PlaybackControls.module.scss';
import PlayIcon from '../../../public/icons/play_arrow.svg';
import ForwardIcon from '../../../public/icons/forward_10.svg';
import PauseIcon from '../../../public/icons/pause-circle-outline.svg';
import ReplayIcon from '../../../public/icons/replay_10.svg';
import ShareIcon from '../../../public/icons/share.svg';
import RepeatIcon from '../../../public/icons/ic_repeat_24px 1.svg';
import Button, { ButtonShape, ButtonSize, ButtonVariant } from '../dls/Button/Button';
import { triggerPauseAudio, triggerPlayAudio, triggerSeek } from './EventTriggers';

const PlaybackControls = () => {
  const isPlaying = useSelector(selectIsPlaying);
  return (
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
      {isPlaying ? (
        <Button
          variant={ButtonVariant.Ghost}
          shape={ButtonShape.Circle}
          size={ButtonSize.Large}
          onClick={withStopPropagation(triggerPauseAudio)}
        >
          <PauseIcon />
        </Button>
      ) : (
        <Button
          variant={ButtonVariant.Ghost}
          shape={ButtonShape.Circle}
          size={ButtonSize.Large}
          onClick={withStopPropagation(triggerPlayAudio)}
        >
          <PlayIcon />
        </Button>
      )}
      <Button
        variant={ButtonVariant.Ghost}
        shape={ButtonShape.Circle}
        size={ButtonSize.Large}
        onClick={withStopPropagation(() => triggerSeek(10))}
      >
        <ForwardIcon />
      </Button>
      <Button variant={ButtonVariant.Ghost} shape={ButtonShape.Circle} size={ButtonSize.Large}>
        <ShareIcon />
      </Button>
    </div>
  );
};

export default PlaybackControls;
