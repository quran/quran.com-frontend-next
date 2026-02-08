import { useContext } from 'react';

import { useSelector } from '@xstate/react';
import useTranslation from 'next-translate/useTranslation';

import CloseButton from './Buttons/CloseButton';
import PlayPauseButton from './Buttons/PlayPauseButton';
import VolumeControl from './Buttons/VolumeControl';
import OverflowAudioPlayerActionsMenu from './OverflowAudioPlayerActionsMenu';
import styles from './PlaybackControls.module.scss';
import SeekButton, { SeekButtonType } from './SeekButton';

import useGetChaptersData from '@/hooks/useGetChaptersData';
import { selectIsLoading } from 'src/xstate/actors/audioPlayer/selectors';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';

interface PlaybackControlsProps {
  hideOverflowMenu?: boolean;
  isEmbedded?: boolean;
}

const PlaybackControls = ({ hideOverflowMenu, isEmbedded }: PlaybackControlsProps) => {
  const audioService = useContext(AudioPlayerMachineContext);
  const isLoading = useSelector(audioService, selectIsLoading);
  const { lang } = useTranslation('common');
  const chaptersData = useGetChaptersData(lang);

  return (
    <div className={styles.container}>
      {!hideOverflowMenu && (
        <div className={styles.actionItem}>
          <OverflowAudioPlayerActionsMenu />
        </div>
      )}
      <div className={styles.actionItem}>
        <VolumeControl shouldUseModalZIndex={isEmbedded} />
      </div>
      <div className={styles.actionItem}>
        <SeekButton
          type={SeekButtonType.PrevAyah}
          isLoading={isLoading}
          chaptersData={chaptersData}
        />
      </div>
      <div className={styles.actionItem}>
        <PlayPauseButton />
      </div>
      <div className={styles.actionItem}>
        <SeekButton
          type={SeekButtonType.NextAyah}
          isLoading={isLoading}
          chaptersData={chaptersData}
        />
      </div>
      <div className={styles.actionItem}>
        <CloseButton />
      </div>
    </div>
  );
};

export default PlaybackControls;
