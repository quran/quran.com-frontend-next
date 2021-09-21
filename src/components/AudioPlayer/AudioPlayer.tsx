/* eslint-disable max-lines */
import React, { useCallback, useEffect, useRef, useState } from 'react';

import classNames from 'classnames';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import MinusTenIcon from '../../../public/icons/minus-ten.svg';
import UnfoldLessIcon from '../../../public/icons/unfold_less.svg';
import UnfoldMoreIcon from '../../../public/icons/unfold_more.svg';

import styles from './AudioPlayer.module.scss';
import CloseButton from './CloseButton';
import { triggerPauseAudio, triggerSeek, triggerSetCurrentTime } from './EventTriggers';
import MediaSessionApiListeners from './MediaSessionApiListeners';
// import AudioKeyBoardListeners from './AudioKeyboardListeners';
import PlaybackControls from './PlaybackControls';
import PlayPauseButton from './PlayPauseButton';
import Slider from './Slider';

import Button, { ButtonShape, ButtonSize, ButtonVariant } from 'src/components/dls/Button/Button';
import useScrollDirection, { ScrollDirection } from 'src/hooks/useScrollDirection';
import {
  setIsPlaying,
  selectAudioFile,
  selectAudioFileStatus,
  setAudioStatus,
  AudioFileStatus,
  selectReciter,
  setIsMobileMinimizedForScrolling,
  setIsExpanded,
  selectIsExpanded,
  selectIsMobileMinimizedForScrolling,
} from 'src/redux/slices/AudioPlayer/state';
import { withStopPropagation } from 'src/utils/event';

const AudioPlayer = () => {
  const dispatch = useDispatch();
  const audioPlayerEl = useRef(null);
  const audioFile = useSelector(selectAudioFile, shallowEqual);
  const audioFileStatus = useSelector(selectAudioFileStatus);
  const isHidden = audioFileStatus === AudioFileStatus.NoFile;
  const isLoading = audioFileStatus === AudioFileStatus.Loading;
  const reciterName = useSelector(selectReciter, shallowEqual).name;
  const durationInSeconds = audioFile?.duration / 1000 || 0;
  const isExpanded = useSelector(selectIsExpanded);
  const isMobileMinimizedForScrolling = useSelector(selectIsMobileMinimizedForScrolling);
  const [currentTime, setCurrentTime] = useState(0); // TODO: get current time from last session
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

  const toggleIsExpanded = () => {
    dispatch({ type: setIsExpanded.type, payload: !isExpanded });
  };

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
    setCurrentTime(audioPlayerEl.current.currentTime);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={toggleIsExpanded}
      onKeyPress={toggleIsExpanded}
      className={classNames(styles.container, {
        [styles.containerHidden]: isHidden,
        [styles.containerDefault]: !isExpanded,
        [styles.containerExpanded]: isExpanded,
        [styles.containerMinimized]: isMobileMinimizedForScrolling,
      })}
    >
      <div
        className={classNames(styles.innerContainer, {
          [styles.innerContainerExpanded]: isExpanded,
        })}
      >
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
        <div
          className={classNames(styles.actionButtonsContainer, {
            [styles.actionButtonsContainerHidden]: isExpanded,
            [styles.defaultAndMinimized]: isMobileMinimizedForScrolling && !isExpanded,
          })}
        >
          <div className={styles.mobileCloseButtonContainer}>
            <CloseButton />
          </div>
          <PlayPauseButton />
          <div className={styles.seekBackwardsContainer}>
            <Button
              tooltip="Rewind 10 seconds"
              shape={ButtonShape.Circle}
              size={ButtonSize.Large}
              disabled={isLoading}
              variant={ButtonVariant.Ghost}
              onClick={withStopPropagation(() => triggerSeek(-10))}
            >
              <MinusTenIcon />
            </Button>
          </div>
        </div>
        <div className={styles.sliderContainer}>
          <Slider
            isMobileMinimizedForScrolling={isMobileMinimizedForScrolling}
            isExpanded={isExpanded}
            currentTime={currentTime}
            audioDuration={durationInSeconds}
            setTime={triggerSetCurrentTime}
            reciterName={reciterName}
          />
        </div>
        <div className={styles.desktopRightActions}>
          {isExpanded ? (
            <Button tooltip="Minimize" shape={ButtonShape.Circle} variant={ButtonVariant.Ghost}>
              <UnfoldLessIcon />
            </Button>
          ) : (
            <Button tooltip="Expand" variant={ButtonVariant.Ghost} shape={ButtonShape.Circle}>
              <UnfoldMoreIcon />
            </Button>
          )}
          <CloseButton />
        </div>
      </div>
      {isExpanded && <PlaybackControls />}
    </div>
  );
};

export default AudioPlayer;
