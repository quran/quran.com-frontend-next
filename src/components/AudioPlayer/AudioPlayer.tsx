import React, { useCallback, useEffect, useRef } from 'react';

import dynamic from 'next/dynamic';
import { useDispatch, useSelector } from 'react-redux';

import {
  setIsPlaying,
  selectAudioDataStatus,
  setAudioStatus,
  AudioDataStatus,
  selectPlaybackRate,
} from 'src/redux/slices/AudioPlayer/state';

const AudioPlayerBody = dynamic(() => import('./AudioPlayerBody'), {
  ssr: false,
});

const AudioPlayer = () => {
  const dispatch = useDispatch();
  const audioPlayerElRef = useRef<HTMLAudioElement>(null);
  const audioDataStatus = useSelector(selectAudioDataStatus);
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

  // don't put the audio player in the DOM if it's not open.
  if (isHidden) {
    return <></>;
  }

  return <AudioPlayerBody isHidden={isHidden} audioPlayerElRef={audioPlayerElRef} />;
};

export default AudioPlayer;
