import React from 'react';
import { useDispatch } from 'react-redux';
import { playVerse } from 'src/redux/slices/AudioPlayer/state';

import PlayIcon from '../../../public/icons/play-circle-outline.svg';
import Button from '../dls/Button/Button';

interface Props {
  verseKey: string;
}
const PlayVerseAudioButton = (props: Props) => {
  const dispatch = useDispatch();
  return (
    <Button
      icon={<PlayIcon />}
      onClick={() => {
        dispatch(playVerse(props.verseKey));
      }}
    />
  );
};
export default PlayVerseAudioButton;
