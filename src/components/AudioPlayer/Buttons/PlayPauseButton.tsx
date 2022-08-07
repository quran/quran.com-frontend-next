import { useContext } from 'react';

import { useActor } from '@xstate/react';
import useTranslation from 'next-translate/useTranslation';
// import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import PauseIcon from '../../../../public/icons/pause.svg';
import PlayIcon from '../../../../public/icons/play-arrow.svg';
// import { triggerPauseAudio, triggerPlayAudio } from '../EventTriggers';
// import SurahAudioMismatchModal from '../SurahAudioMismatchModal';

import Button, { ButtonShape, ButtonVariant } from 'src/components/dls/Button/Button';
import Spinner, { SpinnerSize } from 'src/components/dls/Spinner/Spinner';
// import DataContext from 'src/contexts/DataContext';
// import useChapterIdsByUrlPath from 'src/hooks/useChapterId';
// import useGetQueryParamOrReduxValue from 'src/hooks/useGetQueryParamOrReduxValue';
// import {
//   exitRepeatMode,
//   loadAndPlayAudioData,
//   selectAudioData,
//   selectAudioDataStatus,
//   selectAudioPlayerState,
// } from 'src/redux/slices/AudioPlayer/state';
// import AudioDataStatus from 'src/redux/types/AudioDataStatus';
// import { getChapterData } from 'src/utils/chapter';
import { withStopPropagation } from 'src/utils/event';
// import { logButtonClick } from 'src/utils/eventLogger';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';
// import QueryParam from 'types/QueryParam';

const PlayPauseButton = () => {
  const { t } = useTranslation('common');
  // const dispatch = useDispatch();
  // const chaptersData = useContext(DataContext);

  const audioService = useContext(AudioPlayerMachineContext);
  const [currentState, send] = useActor(audioService);

  const isPlaying = currentState.matches('VISIBLE.AUDIO_PLAYER_INITIATED.PLAYING');
  const isLoading = currentState.hasTag('loading');

  // const { isPlaying, playbackRate } = useSelector(selectAudioPlayerState, shallowEqual);
  // const isLoading = useSelector(selectAudioDataStatus) === AudioDataStatus.Loading;
  // const { value: reciterId }: { value: number } = useGetQueryParamOrReduxValue(QueryParam.Reciter);
  // const audioData = useSelector(selectAudioData, shallowEqual);
  // const currentReadingChapterIds = useChapterIdsByUrlPath(lang);
  // const currentAudioChapterId = audioData?.chapterId?.toString();

  // const [isMismatchModalVisible, setIsMismatchModalVisible] = useState(false);

  // check if the current audio file matches the current reading chapter
  // continue playing if it matches
  // otherwise, show the mismatch modal
  // TODO: implement mismatch
  // const onClickPlay = () => {
  //   logButtonClick('audio_player_play');
  //   const noReadingChapterIdsFound = currentReadingChapterIds.length === 0; // e.g : homepage
  //   if (currentReadingChapterIds.includes(currentAudioChapterId) || noReadingChapterIdsFound) {
  //     triggerPlayAudio(playbackRate);
  //   } else {
  //     setIsMismatchModalVisible(true);
  //   }
  // };

  let button;

  if (isLoading)
    button = (
      <Button
        tooltip={`${t('loading')}...`}
        shape={ButtonShape.Circle}
        variant={ButtonVariant.Ghost}
      >
        <Spinner size={SpinnerSize.Large} />
      </Button>
    );
  else if (isPlaying)
    button = (
      <Button
        tooltip={t('audio.player.pause')}
        shape={ButtonShape.Circle}
        variant={ButtonVariant.Ghost}
        onClick={withStopPropagation(() => {
          send('TOGGLE');
        })}
      >
        <PauseIcon />
      </Button>
    );
  else if (!isPlaying)
    button = (
      <Button
        tooltip={t('audio.player.play')}
        shape={ButtonShape.Circle}
        variant={ButtonVariant.Ghost}
        onClick={withStopPropagation(() => {
          send('TOGGLE');
        })}
        shouldFlipOnRTL={false}
      >
        <PlayIcon />
      </Button>
    );

  // const [firstCurrentReadingChapterId] = currentReadingChapterIds; // get the first chapter in this page

  // const onStartOverClicked = () => {
  //   dispatch(exitRepeatMode());
  //   dispatch(loadAndPlayAudioData({ chapter: Number(firstCurrentReadingChapterId), reciterId }));
  //   setIsMismatchModalVisible(false);
  // };

  // const onContinueClicked = () => {
  //   triggerPlayAudio(playbackRate);
  //   setIsMismatchModalVisible(false);
  // };

  return (
    <>
      {button}
      {/* <SurahAudioMismatchModal
        isOpen={isMismatchModalVisible}
        currentAudioChapter={
          getChapterData(chaptersData, currentAudioChapterId)?.transliteratedName
        }
        currentReadingChapter={
          getChapterData(chaptersData, firstCurrentReadingChapterId)?.transliteratedName
        }
        onContinue={onContinueClicked}
        onStartOver={onStartOverClicked}
      /> */}
    </>
  );
};

export default PlayPauseButton;
