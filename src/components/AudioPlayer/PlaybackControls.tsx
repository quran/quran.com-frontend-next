import { useSelector } from 'react-redux';

import CloseButton from './Buttons/CloseButton';
import PlayPauseButton from './Buttons/PlayPauseButton';
import OverflowAudioPlayerActionsMenu from './OverflowAudioPlayerActionsMenu';
import styles from './PlaybackControls.module.scss';
import SeekButton, { SeekButtonType } from './SeekButton';

import { AudioDataStatus, selectAudioDataStatus } from 'src/redux/slices/AudioPlayer/state';

const PlaybackControls = () => {
  const audioDataStatus = useSelector(selectAudioDataStatus);
  const isLoading = audioDataStatus === AudioDataStatus.Loading;

  return (
    <div className={styles.container}>
      <div className={styles.actionItem}>
        <OverflowAudioPlayerActionsMenu />
      </div>
      <div className={styles.actionItem}>
        <SeekButton type={SeekButtonType.Rewind} isLoading={isLoading} />
      </div>
      <PlayPauseButton />
      <div className={styles.actionItem}>
        <SeekButton type={SeekButtonType.Rewind} isLoading={isLoading} />
      </div>
      <div className={styles.actionItem}>
        <CloseButton />
      </div>
    </div>
  );
};

export default PlaybackControls;
