/* eslint-disable react/no-multi-comp */
import React, { useContext, useEffect, useRef } from 'react';

import { inspect } from '@xstate/inspect';
import { useActor } from '@xstate/react';
import classNames from 'classnames';
import { sendError } from 'next/dist/server/api-utils';
import dynamic from 'next/dynamic';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import usePlayNextAudioTrackForRadio from '../Radio/usePlayNextAudioTrackForRadio';

import styles from './AudioPlayer.module.scss';
import { AudioPlayerMachineContext } from './audioPlayerMachine';

import Spinner from 'src/components/dls/Spinner/Spinner';
import {
  setAudioStatus,
  selectPlaybackRate,
  selectAudioData,
} from 'src/redux/slices/AudioPlayer/state';
import AudioDataStatus from 'src/redux/types/AudioDataStatus';

const AudioPlayerBody = dynamic(() => import('./AudioPlayerBody'), {
  ssr: false,
  loading: () => (
    <div className={styles.spinner}>
      <Spinner />
    </div>
  ),
});

const AudioPlayer = () => {
  const audioService = useContext(AudioPlayerMachineContext);
  const [current, send] = useActor(audioService);

  const dispatch = useDispatch();
  const audioPlayerElRef = useRef<HTMLAudioElement>(null);
  const audioData = useSelector(selectAudioData, shallowEqual);
  const isHidden = current.matches('closed');
  const playbackRate = useSelector(selectPlaybackRate);

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
          src={current?.context?.audioData?.audioUrl}
          style={{ display: 'none' }}
          id="audio-player"
          ref={audioPlayerElRef}
          preload="auto"
          onPlay={() => {
            send('PLAYED');
          }}
          onPause={() => {
            send('PAUSED');
          }}
          onError={(e) => {
            send('AUDIO_PLAYER_ERROR');
          }}
          onAbort={() => {
            // sendError('')
          }}
          onStalled={() => {
            send('AUDIO_PLAYER_STALLED');
          }}
          onEnded={() => {
            send('ENDED');
          }}
          onTimeUpdate={() => {
            send({ type: 'CURRENT_TIME_CHANGED', timestamp: audioPlayerElRef.current.currentTime });
          }}
          onCanPlayThrough={() => {
            send({
              type: 'CAN_PLAY',
              audioPlayerRef: audioPlayerElRef.current,
            });
          }}
          onSeeking={() => {
            dispatch({ type: setAudioStatus.type, payload: AudioDataStatus.Loading });
          }}
          onSeeked={() => {
            dispatch({ type: setAudioStatus.type, payload: AudioDataStatus.Ready });
          }}
        />
        {!isHidden && <AudioPlayerBody audioData={audioData} audioPlayerElRef={audioPlayerElRef} />}
      </div>
    </>
  );
};

export default AudioPlayer;
