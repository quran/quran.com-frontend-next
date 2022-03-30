import React, { useCallback, useEffect, useRef } from 'react';

import classNames from 'classnames';
import dynamic from 'next/dynamic';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import usePlayNextAudioTrackForRadio from '../Radio/usePlayNextAudioTrackForRadio';

import styles from './AudioPlayer.module.scss';

import {
  setIsPlaying,
  selectAudioDataStatus,
  setAudioStatus,
  selectPlaybackRate,
  selectAudioData,
} from 'src/redux/slices/AudioPlayer/state';
import AudioDataStatus from 'src/redux/types/AudioDataStatus';

const AudioPlayerBody = dynamic(() => import('./AudioPlayerBody'), {
  ssr: false,
});

const AudioPlayer = () => {
  const dispatch = useDispatch();
  const audioPlayerElRef = useRef<HTMLAudioElement>(null);
  const audioDataStatus = useSelector(selectAudioDataStatus);
  const audioData = useSelector(selectAudioData, shallowEqual);
  const isHidden = audioDataStatus === AudioDataStatus.NoFile;
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

  usePlayNextAudioTrackForRadio(audioPlayerElRef);

  // Sync the global audio player element reference with the AudioPlayer component.
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.audioPlayerEl = audioPlayerElRef.current;
    }
  }, [audioPlayerElRef]);

  // sync playback rate from redux to audioplayer
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.audioPlayerEl &&
      window.audioPlayerEl.playbackRate !== playbackRate
    ) {
      window.audioPlayerEl.playbackRate = playbackRate;
    }
  }, [audioPlayerElRef, playbackRate]);

  return (
    <>
      <div
        className={classNames(styles.container, styles.containerDefault, {
          [styles.containerHidden]: isHidden,
        })}
      >
        {/* We have to create an inline audio player and hide it due to limitations of how safari requires a play action to trigger: https://stackoverflow.com/questions/31776548/why-cant-javascript-play-audio-files-on-iphone-safari */}
        <audio
          src={audioData?.audioUrl}
          style={{ display: 'none' }}
          id="audio-player"
          ref={audioPlayerElRef}
          preload="auto"
          onPlay={onAudioPlay}
          onPause={onAudioPause}
          onEnded={onAudioEnded}
          onCanPlayThrough={onAudioLoaded}
        />
        {!isHidden && <AudioPlayerBody audioData={audioData} audioPlayerElRef={audioPlayerElRef} />}
      </div>
    </>
  );
};

export default AudioPlayer;
