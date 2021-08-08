import React, { useCallback, useEffect, useRef } from 'react';

import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import {
  AudioPlayerVisibility,
  selectAudioPlayerStyle,
} from '../../redux/slices/AudioPlayer/style';
import {
  setIsPlaying,
  selectAudioPlayerState,
  setCurrentTime,
} from '../../redux/slices/AudioPlayer/state';
import PlayIcon from '../../../public/icons/play-circle-outline.svg';
import PauseIcon from '../../../public/icons/pause-circle-outline.svg';
import MinusTenIcon from '../../../public/icons/minus-ten.svg';
import Button, { ButtonSize } from '../dls/Button/Button';
import Slider from './Slider';
// import AudioKeyBoardListeners from './AudioKeyboardListeners';
import MediaSessionApiListeners from './MediaSessionAPIListeners';
import styles from './AudioPlayer.module.scss';

const AudioPlayer = () => {
  const dispatch = useDispatch();
  const { visibility } = useSelector(selectAudioPlayerStyle);
  const { isPlaying, currentTime } = useSelector(selectAudioPlayerState);
  const isHidden = visibility === AudioPlayerVisibility.Hidden;
  const isMinimized = visibility === AudioPlayerVisibility.Minimized;
  const isExpanded = visibility === AudioPlayerVisibility.Expanded;
  const audioPlayerEl = useRef(null);

  let audioDuration = 0;

  const onAudioPlay = useCallback(() => {
    dispatch({ type: setIsPlaying.type, payload: true });
  }, [dispatch]);
  const onAudioPause = useCallback(() => {
    dispatch({ type: setIsPlaying.type, payload: false });
  }, [dispatch]);

  const onAudioEnded = useCallback(() => {
    dispatch({ type: setIsPlaying.type, payload: false });
  }, [dispatch]);

  // eventListeners useEffect
  useEffect(() => {
    let currentRef = null;
    if (audioPlayerEl && audioPlayerEl.current) {
      currentRef = audioPlayerEl.current;
      currentRef.addEventListener('play', onAudioPlay);
      currentRef.addEventListener('pause', onAudioPause);
      currentRef.addEventListener('ended', onAudioEnded);
    }

    return () => {
      if (currentRef) {
        currentRef.removeEventListener('play', onAudioPlay);
        currentRef.removeEventListener('pause', onAudioPause);
        currentRef.removeEventListener('ended', onAudioEnded);
      }
    };
  }, [audioPlayerEl, onAudioPlay, onAudioPause, onAudioEnded]);

  if (audioPlayerEl.current) {
    audioDuration = audioPlayerEl.current.duration;
  }

  // No need to debounce. The frequency is funciton is set by the browser based on the system it's running on
  const onTimeUpdate = () => {
    // update the current audio time in redux
    dispatch({ type: setCurrentTime.type, payload: audioPlayerEl.current.currentTime });
  };

  const play = useCallback(() => {
    audioPlayerEl.current.play();
  }, [audioPlayerEl]);

  const pause = useCallback(() => {
    audioPlayerEl.current.pause();
  }, [audioPlayerEl]);

  // const togglePlaying = useCallback(() => {
  //   if (isPlaying) {
  //     pause();
  //   } else {
  //     play();
  //   }
  // }, [play, pause, isPlaying]);

  const setTime = useCallback(
    (time) => {
      let newTime = time;
      // upper and lower bound case handling
      if (time < 0) {
        newTime = 0;
      } else if (time > audioDuration) {
        newTime = audioDuration;
      }

      audioPlayerEl.current.currentTime = newTime;
      dispatch({ type: setCurrentTime.type, payload: audioPlayerEl.current.currentTime });
    },
    [audioDuration, dispatch],
  );

  const seek = useCallback(
    (duration) => {
      setTime(audioPlayerEl.current.currentTime + duration);
    },
    [setTime],
  );
  return (
    <div
      className={classNames(styles.container, {
        [styles.containerHidden]: isHidden,
        [styles.containerMinimized]: isMinimized,
        [styles.containerExpanded]: isExpanded,
      })}
    >
      <div className={styles.innerContainer}>
        {/* We have to create an inline audio player and hide it due to limitations of how safari requires a play action to trigger: https://stackoverflow.com/questions/31776548/why-cant-javascript-play-audio-files-on-iphone-safari */}
        <audio
          src="https://server12.mp3quran.net/tnjy/004.mp3"
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
          play={play}
          pause={pause}
          seek={(seekDuration) => seek(seekDuration)}
          playNextTrack={null}
          playPreviousTrack={null}
        />
        <div className={styles.actionButtonsContainer}>
          {isPlaying ? (
            // Pause
            <Button
              icon={<PauseIcon />}
              size={ButtonSize.Medium}
              onClick={() => {
                audioPlayerEl.current.pause();
              }}
            />
          ) : (
            // Play
            <Button
              icon={<PlayIcon />}
              size={ButtonSize.Medium}
              onClick={() => {
                audioPlayerEl.current.play();
              }}
            />
          )}
          <div className={styles.seekBackwardsContainer}>
            <Button icon={<MinusTenIcon />} size={ButtonSize.Medium} onClick={() => seek(-10)} />
          </div>
        </div>
        <div className={styles.sliderContainer}>
          <Slider currentTime={currentTime} audioDuration={audioDuration} setTime={setTime} />
        </div>
        {/* The div below serves as placeholder for a right section, as well as for centering the slider */}
        <div className={styles.placeholderRightSection} />
      </div>
    </div>
  );
};

export default AudioPlayer;
