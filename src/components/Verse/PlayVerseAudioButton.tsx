import React from 'react';

import { useDispatch, shallowEqual, useSelector } from 'react-redux';

import PauseIcon from '../../../public/icons/pause.svg';
import PlayIcon from '../../../public/icons/play-arrow.svg';

import { triggerPauseAudio } from 'src/components/AudioPlayer/EventTriggers';
import Button, { ButtonType } from 'src/components/dls/Button/Button';
import { selectReciter, playFrom } from 'src/redux/slices/AudioPlayer/state';
import { selectIsVerseBeingPlayed } from 'src/redux/slices/QuranReader/highlightedLocation';
import { getChapterNumberFromKey } from 'src/utils/verse';

interface PlayVerseAudioProps {
  timestamp: number;
  verseKey: string;
}
const PlayVerseAudioButton = ({ verseKey, timestamp }: PlayVerseAudioProps) => {
  const dispatch = useDispatch();
  const { id: reciterId } = useSelector(selectReciter, shallowEqual);
  const isVerseBeingPlayed = useSelector(selectIsVerseBeingPlayed(verseKey));
  const chapterId = getChapterNumberFromKey(verseKey);

  if (isVerseBeingPlayed)
    return (
      <Button tooltip="Pause" type={ButtonType.Secondary} onClick={triggerPauseAudio}>
        <PauseIcon />
      </Button>
    );

  return (
    <Button
      tooltip="Play"
      type={ButtonType.Secondary}
      onClick={() => {
        dispatch(
          playFrom({
            chapterId,
            reciterId,
            timestamp,
          }),
        );
      }}
    >
      <PlayIcon />
    </Button>
  );
};
export default PlayVerseAudioButton;
