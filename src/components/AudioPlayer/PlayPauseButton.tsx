import { useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import useChapterIdsByUrlPath from 'src/hooks/useChapterId';
import {
  AudioFileStatus,
  loadAndPlayAudioFile,
  selectAudioFile,
  selectAudioFileStatus,
  selectAudioPlayerState,
} from 'src/redux/slices/AudioPlayer/state';
import { getChapterData } from 'src/utils/chapter';
import { withStopPropagation } from 'src/utils/event';

import PauseIcon from '../../../public/icons/pause.svg';
import PlayIcon from '../../../public/icons/play-arrow.svg';
import Button, { ButtonShape, ButtonSize, ButtonVariant } from '../dls/Button/Button';
import Spinner, { SpinnerSize } from '../dls/Spinner/Spinner';
import { triggerPauseAudio, triggerPlayAudio } from './EventTriggers';
import SurahAudioMismatchModal from './SurahAudioMismatchModal';

const PlayPauseButton = () => {
  const dispatch = useDispatch();

  const { isPlaying } = useSelector(selectAudioPlayerState, shallowEqual);
  const isLoading = useSelector(selectAudioFileStatus) === AudioFileStatus.Loading;

  const audioFile = useSelector(selectAudioFile, shallowEqual);
  const currentReadingChapterIds = useChapterIdsByUrlPath();
  const currentAudioChapterId = audioFile?.chapterId?.toString();

  const [isMismatchModalVisible, setIsMismatchModalVisible] = useState(false);

  // check if the current audio file matches the current reading chapter
  // continue playing if it matches
  // otherwise, show the mismatch modal
  const onClickPlay = () => {
    if (currentReadingChapterIds.includes(currentAudioChapterId)) {
      triggerPlayAudio();
    } else {
      setIsMismatchModalVisible(true);
    }
  };

  let button;

  if (isLoading)
    button = (
      <Button
        tooltip="Loading ..."
        size={ButtonSize.Large}
        shape={ButtonShape.Circle}
        variant={ButtonVariant.Ghost}
        onClick={withStopPropagation(triggerPauseAudio)}
      >
        <Spinner size={SpinnerSize.Large} />
      </Button>
    );

  if (isPlaying) {
    button = (
      <Button
        tooltip="Pause"
        size={ButtonSize.Large}
        shape={ButtonShape.Circle}
        variant={ButtonVariant.Ghost}
        onClick={withStopPropagation(triggerPauseAudio)}
      >
        <PauseIcon />
      </Button>
    );
  }
  if (!isPlaying)
    button = (
      <Button
        tooltip="Play"
        shape={ButtonShape.Circle}
        size={ButtonSize.Large}
        variant={ButtonVariant.Ghost}
        onClick={withStopPropagation(onClickPlay)}
      >
        <PlayIcon />
      </Button>
    );

  const firstCurrentReadingChapterId = currentReadingChapterIds[0]; // get the first chapter in this page
  return (
    <>
      {button}
      <SurahAudioMismatchModal
        open={isMismatchModalVisible}
        currentAudioChapter={getChapterData(currentAudioChapterId)?.nameSimple}
        currentReadingChapter={getChapterData(firstCurrentReadingChapterId)?.nameSimple}
        onContinue={() => {
          triggerPlayAudio();
          setIsMismatchModalVisible(false);
        }}
        onStartOver={() => {
          dispatch(loadAndPlayAudioFile(Number(firstCurrentReadingChapterId)));
          setIsMismatchModalVisible(false);
        }}
      />
    </>
  );
};

export default PlayPauseButton;
