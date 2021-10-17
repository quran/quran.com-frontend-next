import React, { MutableRefObject } from 'react';

import { shallowEqual, useSelector } from 'react-redux';

import AudioKeyBoardListeners from '../AudioKeyboardListeners';
import AudioPlayerSlider from '../AudioPlayerSlider';
import AudioRepeatManager from '../AudioRepeatManager/AudioRepeatManager';
import { togglePlaying, triggerPauseAudio, triggerPlayAudio, triggerSeek } from '../EventTriggers';
import MediaSessionApiListeners from '../MediaSessionApiListeners';
import PlaybackControls from '../PlaybackControls';
import QuranReaderHighlightDispatcher from '../QuranReaderHighlightDispatcher';

import styles from './AudioPlayerBody.module.scss';

import { selectAudioData, selectReciter } from 'src/redux/slices/AudioPlayer/state';

interface Props {
  isHidden: boolean;
  audioPlayerElRef: MutableRefObject<HTMLAudioElement>;
  isMobileMinimizedForScrolling: boolean;
}

const AudioPlayerBody: React.FC<Props> = ({
  isHidden,
  audioPlayerElRef,
  isMobileMinimizedForScrolling,
}) => {
  const audioData = useSelector(selectAudioData, shallowEqual);
  const { id: reciterId } = useSelector(selectReciter, shallowEqual);
  return (
    <>
      <div className={styles.innerContainer}>
        {/* We have to create an inline audio player and hide it due to limitations of how safari requires a play action to trigger: https://stackoverflow.com/questions/31776548/why-cant-javascript-play-audio-files-on-iphone-safari */}
        <audio
          src={audioData?.audioUrl}
          style={{ display: 'none' }}
          id="audio-player"
          ref={audioPlayerElRef}
        />
        <AudioKeyBoardListeners
          seek={(seekDuration) => {
            triggerSeek(seekDuration);
          }}
          togglePlaying={() => togglePlaying()}
          isAudioPlayerHidden={isHidden}
        />
        {reciterId && audioData?.chapterId && (
          <QuranReaderHighlightDispatcher
            audioPlayerElRef={audioPlayerElRef}
            reciterId={reciterId}
            chapterId={audioData?.chapterId}
          />
        )}
        {reciterId && audioData?.chapterId && (
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
        <div className={styles.sliderContainer}>
          <AudioPlayerSlider
            audioPlayerElRef={audioPlayerElRef}
            isMobileMinimizedForScrolling={isMobileMinimizedForScrolling}
          />
        </div>
      </div>
      <PlaybackControls />
    </>
  );
};

export default AudioPlayerBody;
