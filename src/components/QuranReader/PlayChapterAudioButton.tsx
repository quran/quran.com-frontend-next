import { useContext } from 'react';

import { useSelector } from '@xstate/react';
import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import Spinner from '../dls/Spinner/Spinner';

import styles from './PlayButton.module.scss';

import Button, { ButtonShape, ButtonSize, ButtonType } from '@/dls/Button/Button';
import useGetQueryParamOrXstateValue from '@/hooks/useGetQueryParamOrXstateValue';
import PauseIcon from '@/icons/pause.svg';
import PlayIcon from '@/icons/play-arrow.svg';
import QueryParam from '@/types/QueryParam';
import { getChapterData } from '@/utils/chapter';
import { logButtonClick } from '@/utils/eventLogger';
import DataContext from 'src/contexts/DataContext';
import {
  selectIsLoadingCurrentChapter,
  selectIsPlayingCurrentChapter,
} from 'src/xstate/actors/audioPlayer/selectors';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';

interface Props {
  chapterId: number;
}
const PlayChapterAudioButton: React.FC<Props> = ({ chapterId }) => {
  const { t } = useTranslation('common');
  const chaptersData = useContext(DataContext);
  const chapterData = getChapterData(chaptersData, chapterId.toString());

  const audioService = useContext(AudioPlayerMachineContext);
  const isLoadingCurrentChapter = useSelector(audioService, (state) =>
    selectIsLoadingCurrentChapter(state, chapterId),
  );
  const isPlayingCurrentChapter = useSelector(audioService, (state) =>
    selectIsPlayingCurrentChapter(state, chapterId),
  );

  const {
    value: reciterId,
    isQueryParamDifferent: reciterQueryParamDifferent,
  }: { value: number; isQueryParamDifferent: boolean } = useGetQueryParamOrXstateValue(
    QueryParam.RECITER,
  );

  const play = () => {
    logButtonClick('chapter_header_play_audio');
    audioService.send({
      type: 'PLAY_SURAH',
      surah: chapterId,
      reciterId: reciterQueryParamDifferent ? reciterId : undefined,
    });
  };

  const pause = () => {
    logButtonClick('chapter_header_pause_audio');
    audioService.send({
      type: 'TOGGLE',
    });
  };

  if (isLoadingCurrentChapter) {
    return (
      <div className={classNames(styles.container, styles.playChapterAudioButton)}>
        <Button
          type={ButtonType.Secondary}
          shape={ButtonShape.Pill}
          size={ButtonSize.Small}
          prefix={<Spinner />}
          hasSidePadding={false}
          shouldFlipOnRTL={false}
          isDisabled
        >
          {t('loading')}
        </Button>
      </div>
    );
  }

  return (
    <div className={classNames(styles.container, styles.playChapterAudioButton)}>
      {isPlayingCurrentChapter ? (
        <Button
          type={ButtonType.Secondary}
          shape={ButtonShape.Pill}
          size={ButtonSize.Small}
          prefix={<PauseIcon />}
          onClick={pause}
          hasSidePadding={false}
          shouldFlipOnRTL={false}
          data-testid="pause-button"
        >
          {t('listen')}
        </Button>
      ) : (
        <Button
          type={ButtonType.Secondary}
          shape={ButtonShape.Pill}
          size={ButtonSize.Small}
          prefix={<PlayIcon />}
          onClick={play}
          hasSidePadding={false}
          shouldFlipOnRTL={false}
          ariaLabel={t('aria.play-surah', { surahName: chapterData.transliteratedName })}
          data-testid="listen-button"
        >
          {t('listen')}
        </Button>
      )}
    </div>
  );
};

export default PlayChapterAudioButton;
