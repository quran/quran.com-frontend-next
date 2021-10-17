import React, { MutableRefObject } from 'react';

import classNames from 'classnames';
import { shallowEqual, useSelector } from 'react-redux';

import AudioKeyBoardListeners from '../AudioKeyboardListeners';
import styles from '../AudioPlayer.module.scss';
import AudioPlayerSlider from '../AudioPlayerSlider';
import AudioRepeatManager from '../AudioRepeatManager/AudioRepeatManager';
import { togglePlaying, triggerPauseAudio, triggerPlayAudio, triggerSeek } from '../EventTriggers';
import MediaSessionApiListeners from '../MediaSessionApiListeners';
import PlaybackControls from '../PlaybackControls';
import QuranReaderHighlightDispatcher from '../QuranReaderHighlightDispatcher';

import {
  selectAudioData,
  selectReciter,
  selectIsMobileMinimizedForScrolling,
} from 'src/redux/slices/AudioPlayer/state';

interface Props {
  isHidden: boolean;
  audioPlayerElRef: MutableRefObject<HTMLAudioElement>;
}

const AudioPlayerBody: React.FC<Props> = ({ isHidden, audioPlayerElRef }) => {
  const audioData = useSelector(selectAudioData, shallowEqual);
  const { id: reciterId } = useSelector(selectReciter, shallowEqual);
  const isMobileMinimizedForScrolling = useSelector(selectIsMobileMinimizedForScrolling);
  return (
    <>
      <div className={styles.emptySpacePlaceholder} />
      <div
        className={classNames(styles.container, styles.containerDefault, {
          [styles.containerHidden]: isHidden,
          [styles.containerMinimized]: isMobileMinimizedForScrolling,
        })}
      >
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
      </div>
    </>
  );
};

export default AudioPlayerBody;
