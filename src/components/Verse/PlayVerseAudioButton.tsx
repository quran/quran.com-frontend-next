import React from 'react';
import { useDispatch } from 'react-redux';
import { playFrom } from 'src/redux/slices/AudioPlayer/state';

import PlayIcon from '../../../public/icons/play-circle-outline.svg';
import Button, { ButtonVariant } from '../dls/Button/Button';

interface PlayVerseAudioProps {
  timestamp: number;
  chapterId: number;
  reciterId: number;
}
const PlayVerseAudioButton = ({ chapterId, reciterId, timestamp }: PlayVerseAudioProps) => {
  const dispatch = useDispatch();
  return (
    <Button
      variant={ButtonVariant.Ghost}
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
