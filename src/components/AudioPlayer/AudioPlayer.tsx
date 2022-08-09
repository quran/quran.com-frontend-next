/* eslint-disable react/no-multi-comp */
import React, { useContext, useEffect, useRef } from 'react';

import { useActor } from '@xstate/react';
import classNames from 'classnames';
import dynamic from 'next/dynamic';

import styles from './AudioPlayer.module.scss';

import Spinner from 'src/components/dls/Spinner/Spinner';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';

const AudioPlayerBody = dynamic(() => import('./AudioPlayerBody'), {
  ssr: false,
  loading: () => (
    <div className={styles.spinner}>
      <Spinner />
    </div>
  ),
});

const AudioPlayer = () => {
  const audioPlayerRef = useRef<HTMLAudioElement>();
  const audioService = useContext(AudioPlayerMachineContext);
  const [currentState, send] = useActor(audioService);
  const isVisible = currentState.matches('VISIBLE');

  useEffect(() => {
    send({ type: 'SET_AUDIO_REF', audioPlayerRef: audioPlayerRef.current });
  }, [send]);

  const onCanPlay = () => {
    send({ type: 'CAN_PLAY' });
  };

  const onTimeUpdate = () => {
    send({ type: 'UPDATE_TIMING' });
  };

  const onStalled = () => {
    send({
      type: 'STALL',
    });
  };

  const onError = () => {
    send({
      type: 'FAIL',
    });
  };

  const onEnded = () => {
    send({
      type: 'END',
    });
  };

  const onSeeking = () => {
    send({
      type: 'SEEKING',
    });
  };

  const onSeeked = () => {
    send({
      type: 'SEEKED',
    });
  };

  const onPlay = () => {
    send({ type: 'PLAY' });
  };

  const onPause = () => {
    send({ type: 'PAUSE' });
  };

  return (
    <>
      <div
        className={classNames(styles.container, styles.containerDefault, {
          [styles.containerHidden]: !isVisible,
        })}
      >
        {/* We have to create an inline audio player and hide it due to limitations of how safari requires a play action to trigger: https://stackoverflow.com/questions/31776548/why-cant-javascript-play-audio-files-on-iphone-safari */}
        <audio
          style={{ display: 'none' }}
          id="audio-player"
          ref={audioPlayerRef}
          preload="auto"
          onCanPlay={onCanPlay}
          onTimeUpdate={onTimeUpdate}
          onEnded={onEnded}
          onSeeking={onSeeking}
          onSeeked={onSeeked}
          onError={onError}
          onStalled={onStalled}
          onPlay={onPlay}
          onPause={onPause}
        />
        {isVisible && <AudioPlayerBody />}
      </div>
    </>
  );
};

export default AudioPlayer;
