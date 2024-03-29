import { useContext } from 'react';

import { useSelector } from '@xstate/react';

import CloseButton from './Buttons/CloseButton';
import PlayPauseButton from './Buttons/PlayPauseButton';
import VolumeControl from './Buttons/VolumeControl';
import OverflowAudioPlayerActionsMenu from './OverflowAudioPlayerActionsMenu';
import styles from './PlaybackControls.module.scss';
import SeekButton, { SeekButtonType } from './SeekButton';

import { selectIsLoading } from 'src/xstate/actors/audioPlayer/selectors';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';

const PlaybackControls = () => {
  const audioService = useContext(AudioPlayerMachineContext);
  const isLoading = useSelector(audioService, selectIsLoading);

  return (
    <div className={styles.container}>
      <div className={styles.actionItem}>
        <OverflowAudioPlayerActionsMenu />
      </div>
      <div className={styles.actionItem}>
        <VolumeControl />
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
        <CloseButton />
      </div>
    </div>
  );
};

export default PlaybackControls;
