import { useSelector } from 'react-redux';
import { selectIsPlaying } from 'src/redux/slices/AudioPlayer/state';
import styles from './PlaybackControls.module.scss';
import PlayIcon from '../../../public/icons/play-circle-outline.svg';
import ForwardIcon from '../../../public/icons/forward_10.svg';
import PauseIcon from '../../../public/icons/pause-circle-outline.svg';
import ReplayIcon from '../../../public/icons/replay_10.svg';
import Button, { ButtonSize } from '../dls/Button/Button';
import { withStopPropagation } from './util';
import { triggerPauseAudio, triggerPlayAudio } from './EventTriggers';

const PlaybackControls = () => {
  const isPlaying = useSelector(selectIsPlaying);
  return (
    <div className={styles.container}>
      <Button icon={<ReplayIcon />} size={ButtonSize.Medium} />
      {isPlaying ? (
        <Button
          icon={<PauseIcon />}
          size={ButtonSize.Medium}
          onClick={withStopPropagation(triggerPauseAudio)}
        />
      ) : (
        <Button
          icon={<PlayIcon />}
          size={ButtonSize.Medium}
          onClick={withStopPropagation(triggerPlayAudio)}
        />
      )}
      <Button icon={<ForwardIcon />} size={ButtonSize.Medium} />
    </div>
  );
};

export default PlaybackControls;
