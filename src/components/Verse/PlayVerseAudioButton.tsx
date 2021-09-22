import React from 'react';

import { useDispatch } from 'react-redux';

import PlayIcon from '../../../public/icons/play-arrow.svg';

import Button, { ButtonType } from 'src/components/dls/Button/Button';
import { playFrom } from 'src/redux/slices/AudioPlayer/state';

interface PlayVerseAudioProps {
  timestamp: number;
  chapterId: number;
  reciterId: number;
}
const PlayVerseAudioButton = ({ chapterId, reciterId, timestamp }: PlayVerseAudioProps) => {
  const dispatch = useDispatch();
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
