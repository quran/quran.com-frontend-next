import React, { MutableRefObject } from 'react';

import { shallowEqual, useSelector } from 'react-redux';

import AudioKeyBoardListeners from '../AudioKeyboardListeners';
import AudioPlayerSlider from '../AudioPlayerSlider';
import AudioRepeatManager from '../AudioRepeatManager/AudioRepeatManager';
import { togglePlaying, triggerPauseAudio, triggerPlayAudio, triggerSeek } from '../EventTriggers';
import MediaSessionApiListeners from '../MediaSessionApiListeners';
import PlaybackControls from '../PlaybackControls';
import QuranReaderHighlightDispatcher from '../QuranReaderHighlightDispatcher';
import RadioPlaybackControl from '../RadioPlaybackControl';

import styles from './AudioPlayerBody.module.scss';

import { selectReciter, selectIsRadioMode } from 'src/redux/slices/AudioPlayer/state';
import AudioData from 'types/AudioData';

interface Props {
  audioPlayerElRef: MutableRefObject<HTMLAudioElement>;
  isMobileMinimizedForScrolling: boolean;
  audioData: AudioData;
}

const AudioPlayerBody: React.FC<Props> = ({
  audioPlayerElRef,
  isMobileMinimizedForScrolling,
  audioData,
}) => {
  const { id: reciterId } = useSelector(selectReciter, shallowEqual);
  const isRadioMode = useSelector(selectIsRadioMode);

  const isQuranReaderHighlightDispatcherEnabled = !isRadioMode && reciterId && audioData?.chapterId;
  const isAudioRepeatManagerEnabled = !isRadioMode && reciterId && audioData?.chapterId;

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
        {isQuranReaderHighlightDispatcherEnabled && (
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
        )}
        <MediaSessionApiListeners
          play={triggerPlayAudio}
          pause={triggerPauseAudio}
          seek={(seekDuration) => {
            triggerSeek(seekDuration);
          }}
          playNextTrack={null}
          playPreviousTrack={null}
        />
        {!isRadioMode && (
          <div className={styles.sliderContainer}>
            <AudioPlayerSlider
              audioPlayerElRef={audioPlayerElRef}
              isMobileMinimizedForScrolling={isMobileMinimizedForScrolling}
            />
          </div>
        )}
      </div>
      {isRadioMode ? <RadioPlaybackControl /> : <PlaybackControls isRadioMode={isRadioMode} />}
    </>
  );
};

export default AudioPlayerBody;
