import { useContext } from 'react';

import { useSelector } from '@xstate/react';

import PlayPauseButton from './Buttons/PlayPauseButton';
import OverflowAudioPlayerActionsMenu from './OverflowAudioPlayerActionsMenu';
import styles from './PlaybackControls.module.scss';
import RepeatAudioButton from './RepeatButton';
import SeekButton, { SeekButtonType } from './SeekButton';

import { selectIsDownloadingAudio } from 'src/redux/slices/AudioPlayer/state';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';

const PlaybackControls = () => {
  const audioService = useContext(AudioPlayerMachineContext);
  const isLoading = useSelector(audioService, selectIsDownloadingAudio);

  return (
    <div className={styles.container}>
      <div className={styles.actionItem}>
        <RepeatAudioButton isLoading={isLoading} />
      </div>
      <div className={styles.actionItem}>
        <SeekButton type={SeekButtonType.PrevAyah} isLoading={isLoading} />
      </div>
      <div className={styles.actionItem}>
        <PlayPauseButton />
      </div>
      <div className={styles.actionItem}>
        <SeekButton type={SeekButtonType.NextAyah} isLoading={isLoading} />
      </div>
      <div className={styles.actionItem}>
        <OverflowAudioPlayerActionsMenu />
      </div>
    </div>
  );
};

export default PlaybackControls;
