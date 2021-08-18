import { useSelector } from 'react-redux';
import { selectIsPlaying } from 'src/redux/slices/AudioPlayer/state';
import { withStopPropagation } from 'src/utils/event';
import styles from './PlaybackControls.module.scss';
import PlayIcon from '../../../public/icons/play-circle-outline.svg';
import ForwardIcon from '../../../public/icons/forward_10.svg';
import PauseIcon from '../../../public/icons/pause-circle-outline.svg';
import ReplayIcon from '../../../public/icons/replay_10.svg';
import ShareIcon from '../../../public/icons/share.svg';
import RepeatIcon from '../../../public/icons/ic_repeat_24px 1.svg';
import Button, { ButtonSize } from '../dls/Button/Button';
import { triggerPauseAudio, triggerPlayAudio, triggerSeek } from './EventTriggers';

const PlaybackControls = () => {
  const isPlaying = useSelector(selectIsPlaying);
  return (
    <div className={styles.container}>
      <Button icon={<RepeatIcon />} size={ButtonSize.Small} desktopSize={ButtonSize.Medium} />
      <Button
        icon={<ReplayIcon />}
        size={ButtonSize.Small}
        desktopSize={ButtonSize.Medium}
        onClick={withStopPropagation(() => triggerSeek(-10))}
      />
      {isPlaying ? (
        <Button
          icon={<PauseIcon />}
          size={ButtonSize.Small}
          desktopSize={ButtonSize.Medium}
          onClick={withStopPropagation(triggerPauseAudio)}
        />
      ) : (
        <Button
          icon={<PlayIcon />}
          size={ButtonSize.Small}
          desktopSize={ButtonSize.Medium}
          onClick={withStopPropagation(triggerPlayAudio)}
        />
      )}
      <Button
        icon={<ForwardIcon />}
        size={ButtonSize.Small}
        desktopSize={ButtonSize.Medium}
        onClick={withStopPropagation(() => triggerSeek(10))}
      />
      <Button icon={<ShareIcon />} size={ButtonSize.Small} desktopSize={ButtonSize.Medium} />
    </div>
  );
};

export default PlaybackControls;
