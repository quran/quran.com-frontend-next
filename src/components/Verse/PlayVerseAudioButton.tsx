import React, { useState, useEffect } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch, shallowEqual, useSelector } from 'react-redux';

import PauseIcon from '../../../public/icons/pause-outline.svg';
import PlayIcon from '../../../public/icons/play-outline.svg';
import Spinner from '../dls/Spinner/Spinner';
import styles from '../QuranReader/TranslationView/TranslationViewCell.module.scss';

import { triggerPauseAudio } from 'src/components/AudioPlayer/EventTriggers';
import Button, {
  ButtonShape,
  ButtonSize,
  ButtonType,
  ButtonVariant,
} from 'src/components/dls/Button/Button';
import {
  selectReciter,
  playFrom,
  selectAudioDataStatus,
  exitRepeatMode,
} from 'src/redux/slices/AudioPlayer/state';
import { selectIsVerseBeingPlayed } from 'src/redux/slices/QuranReader/highlightedLocation';
import AudioDataStatus from 'src/redux/types/AudioDataStatus';
import { logButtonClick } from 'src/utils/eventLogger';
import { getChapterNumberFromKey } from 'src/utils/verse';

interface PlayVerseAudioProps {
  verseKey: string;
  timestamp: number;
}
const PlayVerseAudioButton = ({ verseKey, timestamp }: PlayVerseAudioProps) => {
  const { t } = useTranslation('common');

  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const { id: reciterId } = useSelector(selectReciter, shallowEqual);
  const isVerseBeingPlayed = useSelector(selectIsVerseBeingPlayed(verseKey));
  const chapterId = getChapterNumberFromKey(verseKey);
  const audioDataStatus = useSelector(selectAudioDataStatus);

  useEffect(() => {
    if (audioDataStatus === AudioDataStatus.Ready) {
      setIsLoading(false);
    }
  }, [audioDataStatus]);

  const onPlayClicked = () => {
    logButtonClick('translation_view_play_verse');
    dispatch(exitRepeatMode());
    dispatch(
      playFrom({
        chapterId,
        reciterId,
        timestamp,
      }),
    );

    if (audioDataStatus !== AudioDataStatus.Ready) {
      setIsLoading(true);
    }
  };

  const onPauseClicked = () => {
    logButtonClick('translation_view_pause_verse');
    triggerPauseAudio();
  };

  if (isLoading)
    return (
      <Button size={ButtonSize.Small} tooltip={t('loading')} type={ButtonType.Secondary}>
        <Spinner />
      </Button>
    );

  if (isVerseBeingPlayed)
    return (
      <Button
        variant={ButtonVariant.Ghost}
        size={ButtonSize.Small}
        tooltip={t('audio.player.pause')}
        onClick={onPauseClicked}
      >
        <span className={styles.icon}>
          <PauseIcon />
        </span>
      </Button>
    );

  return (
    <Button
      size={ButtonSize.Small}
      tooltip={t('audio.player.play')}
      variant={ButtonVariant.Ghost}
      onClick={onPlayClicked}
      shouldFlipOnRTL={false}
      shape={ButtonShape.Circle}
      className={classNames(styles.iconContainer, styles.verseAction)}
    >
      <span className={classNames(styles.icon, styles.playIcon)}>
        <PlayIcon />
      </span>
    </Button>
  );
};
export default PlayVerseAudioButton;
