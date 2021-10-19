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

import { selectReciter } from 'src/redux/slices/AudioPlayer/state';
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
