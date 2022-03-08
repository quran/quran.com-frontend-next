import React, { useState, useEffect } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import Spinner from '../dls/Spinner/Spinner';
import styles from '../QuranReader/TranslationView/TranslationViewCell.module.scss';

import { triggerPauseAudio } from 'src/components/AudioPlayer/EventTriggers';
import Button, {
  ButtonShape,
  ButtonSize,
  ButtonType,
  ButtonVariant,
} from 'src/components/dls/Button/Button';
import { PlayOutlineIcon, PauseOutlineIcon } from 'src/components/Icons';
import useGetQueryParamOrReduxValue from 'src/hooks/useGetQueryParamOrReduxValue';
import {
  playFrom,
  selectAudioDataStatus,
  exitRepeatMode,
} from 'src/redux/slices/AudioPlayer/state';
import { selectIsVerseBeingPlayed } from 'src/redux/slices/QuranReader/highlightedLocation';
import AudioDataStatus from 'src/redux/types/AudioDataStatus';
import { logButtonClick } from 'src/utils/eventLogger';
import { getChapterNumberFromKey } from 'src/utils/verse';
import QueryParam from 'types/QueryParam';

interface PlayVerseAudioProps {
  verseKey: string;
  timestamp: number;
  isTranslationView?: boolean;
  onActionTriggered?: () => void;
}
const PlayVerseAudioButton: React.FC<PlayVerseAudioProps> = ({
  verseKey,
  timestamp,
  isTranslationView = true,
  onActionTriggered,
}) => {
  const { t } = useTranslation('common');

  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const { value: reciterId }: { value: number } = useGetQueryParamOrReduxValue(QueryParam.Reciter);
  const isVerseBeingPlayed = useSelector(selectIsVerseBeingPlayed(verseKey));
  const chapterId = getChapterNumberFromKey(verseKey);
  const audioDataStatus = useSelector(selectAudioDataStatus);

  useEffect(() => {
    if (audioDataStatus === AudioDataStatus.Ready) {
      setIsLoading(false);
    }
  }, [audioDataStatus]);

  const onPlayClicked = () => {
    // eslint-disable-next-line i18next/no-literal-string
    logButtonClick(`${isTranslationView ? 'translation_view' : 'reading_view'}_play_verse`);
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

    if (onActionTriggered) {
      onActionTriggered();
    }
  };

  const onPauseClicked = () => {
    // eslint-disable-next-line i18next/no-literal-string
    logButtonClick(`${isTranslationView ? 'translation_view' : 'reading_view'}_pause_verse`);
    triggerPauseAudio();

    if (onActionTriggered) {
      onActionTriggered();
    }
  };

  if (isLoading)
    return (
      <Button
        size={ButtonSize.Small}
        tooltip={t('loading')}
        type={ButtonType.Success}
        shape={ButtonShape.Circle}
        variant={ButtonVariant.Ghost}
      >
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
        className={classNames(styles.iconContainer, styles.verseAction)}
        shape={ButtonShape.Circle}
      >
        <span className={styles.icon}>
          <PauseOutlineIcon />
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
        <PlayOutlineIcon />
      </span>
    </Button>
  );
};
export default PlayVerseAudioButton;
