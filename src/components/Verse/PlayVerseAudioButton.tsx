import React from 'react';

import { useDispatch } from 'react-redux';

import PlayIcon from '../../../public/icons/play-arrow.svg';
import Button, { ButtonShape, ButtonSize, ButtonVariant } from '../dls/Button/Button';

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
      variant={ButtonVariant.Ghost}
      shape={ButtonShape.Circle}
      size={ButtonSize.Large}
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
