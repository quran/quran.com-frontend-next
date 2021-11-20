import React, { useCallback, useEffect, useRef } from 'react';

import classNames from 'classnames';
import dynamic from 'next/dynamic';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import styles from './AudioPlayer.module.scss';

import {
  setIsPlaying,
  selectAudioDataStatus,
  setAudioStatus,
  AudioDataStatus,
  selectPlaybackRate,
  selectIsMobileMinimizedForScrolling,
  selectAudioData,
} from 'src/redux/slices/AudioPlayer/state';

const AudioPlayerBody = dynamic(() => import('./AudioPlayerBody'), {
  ssr: false,
});

const AudioPlayer = () => {
  const dispatch = useDispatch();
  const audioPlayerElRef = useRef<HTMLAudioElement>(null);
  const audioDataStatus = useSelector(selectAudioDataStatus);
  const audioData = useSelector(selectAudioData, shallowEqual);
  const isHidden = audioDataStatus === AudioDataStatus.NoFile;
  const isMobileMinimizedForScrolling = useSelector(selectIsMobileMinimizedForScrolling);
  const playbackRate = useSelector(selectPlaybackRate);
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

  // sync playback rate from redux to audioplayer
  useEffect(() => {
    if (
      process.browser &&
      window &&
      window.audioPlayerEl &&
      window.audioPlayerEl.playbackRate !== playbackRate
    ) {
      window.audioPlayerEl.playbackRate = playbackRate;
    }
  }, [audioPlayerElRef, playbackRate]);

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
    <>
      <div className={styles.emptySpacePlaceholder} />
      <div
        className={classNames(styles.container, styles.containerDefault, {
          [styles.containerHidden]: isHidden,
          [styles.containerMinimized]: isMobileMinimizedForScrolling,
        })}
      >
        {/* We have to create an inline audio player and hide it due to limitations of how safari requires a play action to trigger: https://stackoverflow.com/questions/31776548/why-cant-javascript-play-audio-files-on-iphone-safari */}
        <audio
          src={audioData?.audioUrl}
          style={{ display: 'none' }}
          id="audio-player"
          ref={audioPlayerElRef}
        />
        {!isHidden && (
          <AudioPlayerBody
            audioData={audioData}
            audioPlayerElRef={audioPlayerElRef}
            isMobileMinimizedForScrolling={isMobileMinimizedForScrolling}
          />
        )}
      </div>
    </>
  );
};

export default AudioPlayer;
