import { useContext } from 'react';

import { useActor } from '@xstate/react';
import useTranslation from 'next-translate/useTranslation';
import { useSelector, shallowEqual } from 'react-redux';

import PauseIcon from '../../../public/icons/pause.svg';
import PlayIcon from '../../../public/icons/play-arrow.svg';
import { AudioPlayerMachineContext } from '../AudioPlayer/audioPlayerMachine';
// import { triggerPauseAudio, triggerPlayAudio } from '../AudioPlayer/EventTriggers';

import styles from './PlayButton.module.scss';

import Button, { ButtonSize, ButtonType, ButtonVariant } from 'src/components/dls/Button/Button';
import DataContext from 'src/contexts/DataContext';
import useGetQueryParamOrReduxValue from 'src/hooks/useGetQueryParamOrReduxValue';
import {
  // exitRepeatMode,
  // playFrom,
  selectAudioData,
  selectIsPlaying,
  // selectIsRadioMode,
  // selectPlaybackRate,
} from 'src/redux/slices/AudioPlayer/state';
import { getChapterData } from 'src/utils/chapter';
import { logButtonClick } from 'src/utils/eventLogger';
import QueryParam from 'types/QueryParam';

interface Props {
  chapterId: number;
}
const PlayChapterAudioButton: React.FC<Props> = ({ chapterId }) => {
  const audioService = useContext(AudioPlayerMachineContext);
  const [state, send] = useActor(audioService);

  const { t } = useTranslation('common');
  // const dispatch = useDispatch();
  const isAudioPlaying = useSelector(selectIsPlaying);
  // const playbackRate = useSelector(selectPlaybackRate);
  const currentAudioData = useSelector(selectAudioData, shallowEqual);
  // const isRadioMode = useSelector(selectIsRadioMode);
  const chaptersData = useContext(DataContext);
  const chapterData = getChapterData(chaptersData, chapterId.toString());

  const isPlayingCurrentChapter = isAudioPlaying && currentAudioData?.chapterId === chapterId;

  const { value: reciterId }: { value: number } = useGetQueryParamOrReduxValue(QueryParam.Reciter);
  const play = () => {
    logButtonClick('chapter_header_play_audio');
    send({
      type: 'REQUEST_PLAY',
      chapterId,
      verseNumber: 1,
    });
    // send('REQUEST_PLAYBACK', {
    //   reciterId,
    //   chapterId,
    // });
    // dispatch(exitRepeatMode());
    // if (currentAudioData?.chapterId === chapterId && !isRadioMode) {
    //   triggerPlayAudio(playbackRate);
    // } else {
    //   dispatch(playFrom({ chapterId, reciterId, timestamp: 0 }));
    // }
  };

  const pause = () => {
    logButtonClick('chapter_header_pause_audio');
    send('REQUEST_PAUSE');
    // triggerPauseAudio();
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
