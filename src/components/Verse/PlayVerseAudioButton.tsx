import React from 'react';

import { useDispatch, shallowEqual, useSelector } from 'react-redux';

import PlayIcon from '../../../public/icons/play-arrow.svg';

import Button, { ButtonType } from 'src/components/dls/Button/Button';
import { selectReciter, playFrom } from 'src/redux/slices/AudioPlayer/state';

interface PlayVerseAudioProps {
  timestamp: number;
  chapterId: number;
}
const PlayVerseAudioButton = ({ chapterId, timestamp }: PlayVerseAudioProps) => {
  const dispatch = useDispatch();
  const { id: reciterId } = useSelector(selectReciter, shallowEqual);

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
