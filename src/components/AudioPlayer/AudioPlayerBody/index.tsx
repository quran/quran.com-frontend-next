import React, { useContext } from 'react';

import { useActor } from '@xstate/react';
// import useTranslation from 'next-translate/useTranslation';
// import { useSelector } from 'react-redux';

import AudioKeyBoardListeners from '../AudioKeyboardListeners';
import AudioPlayerSlider from '../AudioPlayerSlider';
// import AudioRepeatManager from '../AudioRepeatManager/AudioRepeatManager';
import { togglePlaying, triggerSeek } from '../EventTriggers';
// import MediaSessionApiListeners from '../MediaSessionApiListeners';
import PlaybackControls from '../PlaybackControls';
// import QuranReaderHighlightDispatcher from '../QuranReaderHighlightDispatcher';
import RadioPlaybackControl from '../RadioPlaybackControl';

import styles from './AudioPlayerBody.module.scss';

// import useGetQueryParamOrReduxValue from 'src/hooks/useGetQueryParamOrReduxValue';
// import { selectIsInRepeatMode, selectIsRadioMode } from 'src/redux/slices/AudioPlayer/state';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';
// import QueryParam from 'types/QueryParam';

const AudioPlayerBody = () => {
  const audioService = useContext(AudioPlayerMachineContext);
  const [currentState, send] = useActor(audioService);

  // const { lang } = useTranslation();
  const isRadioMode = !!currentState.context.radioActor;
  // const isInRepeatMode = !!currentState.context.repeatActor;

  // const { value: reciterId }: { value: number } = useGetQueryParamOrReduxValue(QueryParam.Reciter);
  // TODO: make sure xstate cover the use case of 'useGetQueryParamOrReduxValue'
  // const { reciterId } = currentState.context;
  // const isAudioRepeatManagerEnabled = isInRepeatMode;

  // const isQuranReaderHighlightDispatcherEnabled = currentState.matches('VISIBLE');

  return (
    <>
      <div className={styles.innerContainer}>
        <AudioKeyBoardListeners
          seek={(seekDuration) => {
            triggerSeek(seekDuration);
          }}
          togglePlaying={() => togglePlaying()}
          isAudioPlayerHidden={false}
        />
        {/* {isQuranReaderHighlightDispatcherEnabled && (
          <QuranReaderHighlightDispatcher
            audioPlayerElRef={audioPlayerElRef}
            reciterId={reciterId}
            chapterId={audioData?.chapterId}
          />
        )}
        {isAudioRepeatManagerEnabled && (
          <AudioRepeatManager
            audioPlayerElRef={audioPlayerElRef}
            reciterId={reciterId}
            chapterId={audioData?.chapterId}
          />
        )} */}
        {/* <MediaSessionApiListeners
          play={triggerPlayAudio}
          pause={triggerPauseAudio}
          seek={(seekDuration) => {
            triggerSeek(seekDuration);
          }}
          playNextTrack={null}
          playPreviousTrack={null}
          locale={lang}
        /> */}
        {!isRadioMode && (
          <div className={styles.sliderContainer}>
            <AudioPlayerSlider />
          </div>
        )}
      </div>
      {isRadioMode ? <RadioPlaybackControl /> : <PlaybackControls />}
    </>
  );
};

export default AudioPlayerBody;
