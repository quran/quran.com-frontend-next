import React, { useState, useEffect } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useDispatch, shallowEqual, useSelector } from 'react-redux';

import PauseIcon from '../../../public/icons/pause.svg';
import PlayIcon from '../../../public/icons/play-arrow.svg';
import Spinner from '../dls/Spinner/Spinner';

import { triggerPauseAudio } from 'src/components/AudioPlayer/EventTriggers';
import Button, { ButtonSize, ButtonType } from 'src/components/dls/Button/Button';
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
  className?: string;
}
const PlayVerseAudioButton = ({ verseKey, timestamp, className }: PlayVerseAudioProps) => {
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
        className={className}
        size={ButtonSize.Small}
        tooltip={t('audio.player.pause')}
        type={ButtonType.Secondary}
        onClick={onPauseClicked}
      >
        <PauseIcon />
      </Button>
    );

  return (
    <Button
      className={className}
      size={ButtonSize.Small}
      tooltip={t('audio.player.play')}
      type={ButtonType.Secondary}
      onClick={onPlayClicked}
      shouldFlipOnRTL={false}
    >
      <PlayIcon />
    </Button>
  );
};
export default PlayVerseAudioButton;
