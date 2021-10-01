import React, { useState, useEffect } from 'react';

import { useDispatch, shallowEqual, useSelector } from 'react-redux';

import PauseIcon from '../../../public/icons/pause.svg';
import PlayIcon from '../../../public/icons/play-arrow.svg';
import Spinner from '../dls/Spinner/Spinner';

import { triggerPauseAudio } from 'src/components/AudioPlayer/EventTriggers';
import Button, { ButtonType } from 'src/components/dls/Button/Button';
import {
  selectReciter,
  playFrom,
  selectAudioFileStatus,
  AudioFileStatus,
  exitRepeatMode,
} from 'src/redux/slices/AudioPlayer/state';
import { selectIsVerseBeingPlayed } from 'src/redux/slices/QuranReader/highlightedLocation';
import { getChapterNumberFromKey } from 'src/utils/verse';

interface PlayVerseAudioProps {
  verseKey: string;
  timestamp: number;
}
const PlayVerseAudioButton = ({ verseKey, timestamp }: PlayVerseAudioProps) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const { id: reciterId } = useSelector(selectReciter, shallowEqual);
  const isVerseBeingPlayed = useSelector(selectIsVerseBeingPlayed(verseKey));
  const chapterId = getChapterNumberFromKey(verseKey);
  const audioFileStatus = useSelector(selectAudioFileStatus);

  useEffect(() => {
    if (audioFileStatus === AudioFileStatus.Ready) {
      setIsLoading(false);
    }
  }, [audioFileStatus]);

  const onPlayClicked = () => {
    dispatch(exitRepeatMode());
    dispatch(
      playFrom({
        chapterId,
        reciterId,
        timestamp,
      }),
    );

    if (audioFileStatus !== AudioFileStatus.Ready) {
      setIsLoading(true);
    }
  };

  if (isLoading)
    return (
      <Button tooltip="Loading" type={ButtonType.Secondary}>
        <Spinner />
      </Button>
    );

  if (isVerseBeingPlayed)
    return (
      <Button tooltip="Pause" type={ButtonType.Secondary} onClick={triggerPauseAudio}>
        <PauseIcon />
      </Button>
    );

  return (
    <Button tooltip="Play" type={ButtonType.Secondary} onClick={onPlayClicked}>
      <PlayIcon />
    </Button>
  );
};
export default PlayVerseAudioButton;
