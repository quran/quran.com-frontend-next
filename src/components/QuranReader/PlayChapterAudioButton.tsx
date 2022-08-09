import { useContext } from 'react';

import { useSelector } from '@xstate/react';
import useTranslation from 'next-translate/useTranslation';

import PauseIcon from '../../../public/icons/pause.svg';
import PlayIcon from '../../../public/icons/play-arrow.svg';

import styles from './PlayButton.module.scss';

import Button, { ButtonSize, ButtonType, ButtonVariant } from 'src/components/dls/Button/Button';
import DataContext from 'src/contexts/DataContext';
import { getChapterData } from 'src/utils/chapter';
import { logButtonClick } from 'src/utils/eventLogger';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';

interface Props {
  chapterId: number;
}
const PlayChapterAudioButton: React.FC<Props> = ({ chapterId }) => {
  const { t } = useTranslation('common');
  const chaptersData = useContext(DataContext);
  const chapterData = getChapterData(chaptersData, chapterId.toString());

  const audioService = useContext(AudioPlayerMachineContext);
  const isAudioPlaying = useSelector(audioService, (state) =>
    state.matches('VISIBLE.AUDIO_PLAYER_INITIATED.PLAYING'),
  );
  const currentSurah = useSelector(audioService, (state) => state.context.surah);
  const isPlayingCurrentChapter = isAudioPlaying && currentSurah === chapterId;

  const play = () => {
    logButtonClick('chapter_header_play_audio');
    audioService.send({
      type: 'PLAY_SURAH',
      surah: chapterId,
    });
  };

  const pause = () => {
    logButtonClick('chapter_header_pause_audio');
    audioService.send({
      type: 'PAUSE',
    });
  };

  return (
    <div className={styles.container}>
      {isPlayingCurrentChapter ? (
        <Button
          variant={ButtonVariant.Ghost}
          type={ButtonType.Success}
          size={ButtonSize.Small}
          prefix={<PauseIcon />}
          onClick={pause}
          hasSidePadding={false}
          shouldFlipOnRTL={false}
        >
          {t('audio.player.pause-audio')}
        </Button>
      ) : (
        <Button
          variant={ButtonVariant.Ghost}
          type={ButtonType.Success}
          size={ButtonSize.Small}
          prefix={<PlayIcon />}
          onClick={play}
          hasSidePadding={false}
          shouldFlipOnRTL={false}
          ariaLabel={t('aria.play-surah', { surahName: chapterData.transliteratedName })}
        >
          {t('audio.play')}
        </Button>
      )}
    </div>
  );
};

export default PlayChapterAudioButton;
