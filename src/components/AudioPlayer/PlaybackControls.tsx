import { useSelector } from 'react-redux';

import CloseButton from './Buttons/CloseButton';
import PlayPauseButton from './Buttons/PlayPauseButton';
import styles from './PlaybackControls.module.scss';
import RepeatButton from './RepeatButton';
import SeekButton, { SeekButtonType } from './SeekButton';

import { AudioFileStatus, selectAudioFileStatus } from 'src/redux/slices/AudioPlayer/state';

const PlaybackControls = () => {
  const audioFileStatus = useSelector(selectAudioFileStatus);
  const isLoading = audioFileStatus === AudioFileStatus.Loading;

  return (
    <div className={styles.container}>
      <div className={styles.actionItem}>
        <RepeatButton />
      </div>
      <div className={styles.actionItem}>
        <SeekButton type={SeekButtonType.Rewind} isLoading={isLoading} />
      </div>
      <div className={styles.actionItem}>
        <PlayPauseButton />
      </div>
      <div className={styles.actionItem}>
        <SeekButton type={SeekButtonType.FastForward} isLoading={isLoading} />
      </div>
      <div className={styles.actionItem}>
        <CloseButton />
      </div>
    </div>
  );
};

export default PlaybackControls;
