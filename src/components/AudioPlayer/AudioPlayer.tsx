import React, { useCallback, useEffect, useRef } from 'react';
import classNames from 'classnames';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  setIsPlaying,
  selectAudioPlayerState,
  setCurrentTime,
  selectAudioFile,
  selectAudioFileStatus,
  setAudioStatus,
  AudioFileStatus,
  selectIsMinimized,
} from '../../redux/slices/AudioPlayer/state';
import PlayIcon from '../../../public/icons/play-circle-outline.svg';
import PauseIcon from '../../../public/icons/pause-circle-outline.svg';
import MinusTenIcon from '../../../public/icons/minus-ten.svg';
import Button, { ButtonSize } from '../dls/Button/Button';
import Slider from './Slider';
// import AudioKeyBoardListeners from './AudioKeyboardListeners';
import MediaSessionApiListeners from './MediaSessionAPIListeners';
import styles from './AudioPlayer.module.scss';
import {
  triggerPauseAudio,
  triggerPlayAudio,
  triggerSeek,
  triggerSetCurrentTime,
} from './EventTriggers';

const AudioPlayer = () => {
  const dispatch = useDispatch();
  const { isPlaying, currentTime } = useSelector(selectAudioPlayerState, shallowEqual);
  const audioPlayerEl = useRef(null);
  const audioFile = useSelector(selectAudioFile, shallowEqual);
  const audioFileStatus = useSelector(selectAudioFileStatus);
  const isMinimized = useSelector(selectIsMinimized);
  const isHidden = audioFileStatus === AudioFileStatus.NoFile;
  const isLoading = audioFileStatus === AudioFileStatus.Loading;

  const durationInSeconds = audioFile?.duration / 1000 || 0;

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
    dispatch({ type: setAudioStatus.type, payload: AudioFileStatus.Ready });
  }, [dispatch]);

  // Sync the global audio player element reference with the AudioPlayer component.
  useEffect(() => {
    if (process.browser && window) {
      window.audioPlayerEl = audioPlayerEl.current;
    }
  }, [audioPlayerEl]);

  // eventListeners useEffect
  useEffect(() => {
    let currentRef = null;
    if (audioPlayerEl && audioPlayerEl.current) {
      currentRef = audioPlayerEl.current;
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
  }, [audioPlayerEl, onAudioPlay, onAudioPause, onAudioEnded, onAudioLoaded]);

  // No need to debounce. The frequency is funciton is set by the browser based on the system it's running on
  const onTimeUpdate = () => {
    // update the current audio time in redux
    dispatch({
      type: setCurrentTime.type,
      payload: audioPlayerEl.current.currentTime,
    });
  };

  useEffect(() => {
    triggerSetCurrentTime(currentTime);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={classNames(styles.container, {
        [styles.containerHidden]: isHidden,
        [styles.containerMinimized]: isMinimized,
        [styles.containerExpanded]: !isMinimized,
        [styles.containerLoading]: isLoading,
      })}
    >
      <div className={styles.innerContainer}>
        {/* We have to create an inline audio player and hide it due to limitations of how safari requires a play action to trigger: https://stackoverflow.com/questions/31776548/why-cant-javascript-play-audio-files-on-iphone-safari */}
        <audio
          src={audioFile?.audioUrl}
          style={{ display: 'none' }}
          id="audio-player"
          ref={audioPlayerEl}
          onTimeUpdate={onTimeUpdate}
        />
        {/* <AudioKeyBoardListeners
          seek={(seekDuration) => seek(seekDuration)}
          togglePlaying={() => togglePlaying()}
        /> */}
        <MediaSessionApiListeners
          play={triggerPauseAudio}
          pause={triggerPauseAudio}
          seek={(seekDuration) => {
            triggerSeek(seekDuration);
          }}
          playNextTrack={null}
          playPreviousTrack={null}
        />
        <div className={styles.actionButtonsContainer}>
          {isPlaying ? (
            // Pause
            <Button icon={<PauseIcon />} size={ButtonSize.Medium} onClick={triggerPauseAudio} />
          ) : (
            // Play
            <Button icon={<PlayIcon />} size={ButtonSize.Medium} onClick={triggerPlayAudio} />
          )}
          <div className={styles.seekBackwardsContainer}>
            <Button
              icon={<MinusTenIcon />}
              size={ButtonSize.Medium}
              onClick={() => triggerSeek(-10)}
            />
          </div>
        </div>
        <div className={styles.sliderContainer}>
          <Slider
            currentTime={currentTime}
            audioDuration={durationInSeconds}
            setTime={triggerSetCurrentTime}
          />
        </div>
        {/* The div below serves as placeholder for a right section, as well as for centering the slider */}
        <div className={styles.placeholderRightSection} />
      </div>
    </div>
  );
};

export default AudioPlayer;
