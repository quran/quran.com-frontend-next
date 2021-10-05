import React, { useCallback, useEffect, useRef } from 'react';

import classNames from 'classnames';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import AudioKeyBoardListeners from './AudioKeyboardListeners';
import styles from './AudioPlayer.module.scss';
import AudioPlayerSlider from './AudioPlayerSlider';
import AudioRepeatManager from './AudioRepeatManager/AudioRepeatManager';
import { togglePlaying, triggerPauseAudio, triggerPlayAudio, triggerSeek } from './EventTriggers';
import MediaSessionApiListeners from './MediaSessionApiListeners';
import PlaybackControls from './PlaybackControls';
import QuranReaderHighlightDispatcher from './QuranReaderHighlightDispatcher';

import useScrollDirection, { ScrollDirection } from 'src/hooks/useScrollDirection';
import {
  setIsPlaying,
  selectAudioData,
  selectAudioDataStatus,
  setAudioStatus,
  AudioDataStatus,
  selectReciter,
  setIsMobileMinimizedForScrolling,
  selectIsMobileMinimizedForScrolling,
} from 'src/redux/slices/AudioPlayer/state';

const AudioPlayer = () => {
  const dispatch = useDispatch();
  const audioPlayerElRef = useRef<HTMLAudioElement>(null);
  const audioData = useSelector(selectAudioData, shallowEqual);
  const audioDataStatus = useSelector(selectAudioDataStatus);
  const isHidden = audioDataStatus === AudioDataStatus.NoFile;
  const { id: reciterId } = useSelector(selectReciter, shallowEqual);
  const isMobileMinimizedForScrolling = useSelector(selectIsMobileMinimizedForScrolling);
  const onDirectionChange = useCallback(
    (direction: ScrollDirection) => {
      if (direction === ScrollDirection.Down && !isMobileMinimizedForScrolling) {
        dispatch({ type: setIsMobileMinimizedForScrolling.type, payload: true });
      } else if (direction === ScrollDirection.Up && isMobileMinimizedForScrolling) {
        dispatch({ type: setIsMobileMinimizedForScrolling.type, payload: false });
      }
    },
    [dispatch, isMobileMinimizedForScrolling],
  );
  useScrollDirection(onDirectionChange);

  const onAudioPlay = useCallback(() => {
    dispatch({ type: setIsPlaying.type, payload: true });
  }, [dispatch]);
  const onAudioPause = useCallback(() => {
    dispatch({ type: setIsPlaying.type, payload: false });
  }, [dispatch]);
  const onAudioEnded = useCallback(() => {
    dispatch({ type: setIsPlaying.type, payload: false });
  }, [dispatch]);
  const onAudioLoaded = useCallback(() => {
    dispatch({ type: setAudioStatus.type, payload: AudioDataStatus.Ready });
  }, [dispatch]);

  // Sync the global audio player element reference with the AudioPlayer component.
  useEffect(() => {
    if (process.browser && window) {
      window.audioPlayerEl = audioPlayerElRef.current;
    }
  }, [audioPlayerElRef]);

  // eventListeners useEffect
  useEffect(() => {
    let currentRef = null;
    if (audioPlayerElRef && audioPlayerElRef.current) {
      currentRef = audioPlayerElRef.current;
      currentRef.addEventListener('play', onAudioPlay);
      currentRef.addEventListener('pause', onAudioPause);
      currentRef.addEventListener('ended', onAudioEnded);
      currentRef.addEventListener('canplaythrough', onAudioLoaded);
    }

    return () => {
      if (currentRef) {
        currentRef.removeEventListener('play', onAudioPlay);
        currentRef.removeEventListener('pause', onAudioPause);
        currentRef.removeEventListener('ended', onAudioEnded);
        currentRef.removeEventListener('canplaythrough', onAudioLoaded);
      }
    };
  }, [audioPlayerElRef, onAudioPlay, onAudioPause, onAudioEnded, onAudioLoaded]);

  return (
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
  );
};

export default AudioPlayer;
