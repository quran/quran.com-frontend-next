import { useContext } from 'react';

import { useSelector } from '@xstate/react';
import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import Spinner from '../dls/Spinner/Spinner';

import styles from './PlayButton.module.scss';

import Button, { ButtonShape, ButtonSize, ButtonType, ButtonVariant } from '@/dls/Button/Button';
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

export enum PlayButtonVariant {
  Default = 'default',
  Secondary = 'secondary',
}
interface Props {
  chapterId: number;
  playLabel?: string;
  pauseLabel?: string;
  type?: PlayButtonVariant;
  containerClassName?: string;
}
const PlayChapterAudioButton: React.FC<Props> = ({
  chapterId,
  playLabel,
  pauseLabel,
  type = PlayButtonVariant.Secondary,
  containerClassName,
}) => {
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

  // Determine button type, shape, and variant based on the PlayButtonVariant
  const buttonType =
    type === PlayButtonVariant.Secondary ? ButtonType.Secondary : ButtonType.Success;
  const buttonShape = type === PlayButtonVariant.Secondary ? ButtonShape.Pill : undefined;
  const buttonVariant = type === PlayButtonVariant.Default ? ButtonVariant.Ghost : undefined;

  if (isLoadingCurrentChapter) {
    return (
      <div className={classNames(styles.container, containerClassName)}>
        <Button
          variant={buttonVariant}
          type={buttonType}
          shape={buttonShape}
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
    <div className={classNames(styles.container, containerClassName)}>
      {isPlayingCurrentChapter ? (
        <Button
          variant={buttonVariant}
          type={buttonType}
          shape={buttonShape}
          size={ButtonSize.Small}
          prefix={<PauseIcon />}
          onClick={pause}
          hasSidePadding={false}
          shouldFlipOnRTL={false}
        >
          {pauseLabel || t('audio.player.pause-audio')}
        </Button>
      ) : (
        <Button
          variant={buttonVariant}
          type={buttonType}
          shape={buttonShape}
          size={ButtonSize.Small}
          prefix={<PlayIcon />}
          onClick={play}
          hasSidePadding={false}
          shouldFlipOnRTL={false}
          ariaLabel={t('aria.play-surah', { surahName: chapterData.transliteratedName })}
        >
          {playLabel || t('audio.play')}
        </Button>
      )}
    </div>
  );
};

export default PlayChapterAudioButton;
