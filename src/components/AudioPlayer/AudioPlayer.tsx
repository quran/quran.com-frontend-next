import React, { useCallback, useEffect, useRef } from 'react';
import classNames from 'classnames';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { withStopPropagation } from 'src/utils/event';
import {
  setIsPlaying,
  selectAudioPlayerState,
  setCurrentTime,
  selectAudioFile,
  selectAudioFileStatus,
  setAudioStatus,
  AudioFileStatus,
  selectVisibility,
  setVisibility,
  Visibility,
  selectReciter,
} from '../../redux/slices/AudioPlayer/state';
import MinusTenIcon from '../../../public/icons/minus-ten.svg';
import UnfoldLessIcon from '../../../public/icons/unfold_less.svg';
import UnfoldMoreIcon from '../../../public/icons/unfold_more.svg';
import Button, { ButtonShape, ButtonSize, ButtonVariant } from '../dls/Button/Button';
import Slider from './Slider';
// import AudioKeyBoardListeners from './AudioKeyboardListeners';
import MediaSessionApiListeners from './MediaSessionAPIListeners';
import styles from './AudioPlayer.module.scss';
import { triggerPauseAudio, triggerSeek, triggerSetCurrentTime } from './EventTriggers';
import PlaybackControls from './PlaybackControls';
import PlayPauseButton from './PlayPauseButton';
import CloseButton from './CloseButton';

const AudioPlayer = () => {
  const dispatch = useDispatch();
  const { currentTime } = useSelector(selectAudioPlayerState, shallowEqual);
  const audioPlayerEl = useRef(null);
  const audioFile = useSelector(selectAudioFile, shallowEqual);
  const audioFileStatus = useSelector(selectAudioFileStatus);
  const visibility = useSelector(selectVisibility);
  const isHidden = audioFileStatus === AudioFileStatus.NoFile;
  const isLoading = audioFileStatus === AudioFileStatus.Loading;
  const reciterName = useSelector(selectReciter).name;
  const durationInSeconds = audioFile?.duration / 1000 || 0;

  const toggleVisibility = () => {
    const nextValue = visibility === Visibility.Default ? Visibility.Expanded : Visibility.Default;
    dispatch({ type: setVisibility.type, payload: nextValue });
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
      role="button"
      tabIndex={0}
      onClick={toggleVisibility}
      onKeyPress={toggleVisibility}
      className={classNames(styles.container, {
        [styles.containerHidden]: isHidden,
        [styles.containerDefault]: visibility === Visibility.Default,
        [styles.containerExpanded]: visibility === Visibility.Expanded,
      })}
    >
      <div
        className={classNames(styles.innerContainer, {
          [styles.innerContainerExpanded]: visibility === Visibility.Expanded,
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
            [styles.actionButtonsContainerHidden]: visibility === Visibility.Expanded,
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
            visibility={visibility}
            currentTime={currentTime}
            audioDuration={durationInSeconds}
            setTime={triggerSetCurrentTime}
            reciterName={reciterName}
          />
        </div>
        <div className={styles.desktopRightActions}>
          {visibility === Visibility.Expanded && (
            <Button tooltip="Minimize" shape={ButtonShape.Circle} variant={ButtonVariant.Ghost}>
              <UnfoldLessIcon />
            </Button>
          )}
          {visibility === Visibility.Default && (
            <Button tooltip="Expand" variant={ButtonVariant.Ghost} shape={ButtonShape.Circle}>
              <UnfoldMoreIcon />
            </Button>
          )}
          <CloseButton />
        </div>
      </div>
      {visibility === Visibility.Expanded && <PlaybackControls />}
    </div>
  );
};

export default AudioPlayer;
