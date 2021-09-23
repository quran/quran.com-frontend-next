import React from 'react';

import { useDispatch, shallowEqual, useSelector } from 'react-redux';

import PauseIcon from '../../../public/icons/pause.svg';
import PlayIcon from '../../../public/icons/play-arrow.svg';
import Spinner from '../dls/Spinner/Spinner';

import { triggerPauseAudio } from 'src/components/AudioPlayer/EventTriggers';
import Button, { ButtonType } from 'src/components/dls/Button/Button';
import {
  selectReciter,
  playFrom,
  selectVerseAudioStatus,
  VerseAudioStatus,
} from 'src/redux/slices/AudioPlayer/state';
import { getChapterNumberFromKey } from 'src/utils/verse';

interface PlayVerseAudioProps {
  timestamp: number;
  verseKey: string;
}
const PlayVerseAudioButton = ({ verseKey, timestamp }: PlayVerseAudioProps) => {
  const dispatch = useDispatch();
  const { id: reciterId } = useSelector(selectReciter, shallowEqual);
  const verseAudioStatus = useSelector(selectVerseAudioStatus(verseKey));
  const chapterId = getChapterNumberFromKey(verseKey);
  console.log(verseAudioStatus, verseKey);

  if (verseAudioStatus === VerseAudioStatus.Loading)
    return (
      <Button tooltip="Pause" type={ButtonType.Secondary} onClick={triggerPauseAudio}>
        <Spinner />
      </Button>
    );

  if (verseAudioStatus === VerseAudioStatus.Playing)
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
