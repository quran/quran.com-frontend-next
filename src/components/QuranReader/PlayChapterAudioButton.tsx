import { useContext } from 'react';

import { useSelector } from '@xstate/react';
import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import Spinner from '../dls/Spinner/Spinner';

import styles from './PlayButton.module.scss';

import Button, { ButtonShape, ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import useDirection from '@/hooks/useDirection';
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
  const direction = useDirection();
  const isRTL = direction === 'rtl';

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
          variant={ButtonVariant.ModeToggle}
          shape={ButtonShape.Pill}
          size={ButtonSize.XSmall}
          prefix={isRTL ? undefined : <Spinner />}
          suffix={isRTL ? <Spinner /> : undefined}
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
          variant={ButtonVariant.ModeToggle}
          shape={ButtonShape.Pill}
          size={ButtonSize.XSmall}
          prefix={isRTL ? undefined : <PauseIcon />}
          suffix={isRTL ? <PauseIcon /> : undefined}
          onClick={pause}
          hasSidePadding={false}
          shouldFlipOnRTL={false}
          isSelected
          data-testid="pause-button"
        >
          {t('listen')}
        </Button>
      ) : (
        <Button
          variant={ButtonVariant.ModeToggle}
          shape={ButtonShape.Pill}
          size={ButtonSize.XSmall}
          prefix={isRTL ? undefined : <PlayIcon />}
          suffix={isRTL ? <PlayIcon /> : undefined}
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
