import React from 'react';
import { useDispatch } from 'react-redux';
import { playVerse } from 'src/redux/slices/AudioPlayer/state';
import Verse from 'types/Verse';

import PlayIcon from '../../../public/icons/play-circle-outline.svg';
import Button from '../dls/Button/Button';

interface PlayVerseAudioProps {
  verse: Verse;
}
const PlayVerseAudioButton = (props: PlayVerseAudioProps) => {
  const dispatch = useDispatch();
  return (
    <Button
      icon={<PlayIcon />}
      onClick={() => {
        dispatch(playVerse(props.verse));
      }}
    />
  );
};
export default PlayVerseAudioButton;
