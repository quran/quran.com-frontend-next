import React, { useRef } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { AUDIO_PLAYER_EXPANDED_HEIGHT, AUDIO_PLAYER_MINIZED_HEIGHT } from 'src/styles/constants';
import {
  AudioPlayerVisibility,
  selectAudioPlayerStyle,
} from '../../redux/slices/AudioPlayer/style';
import {
  setIsPlaying,
  selectAudioPlayerState,
  setCurrentTime,
} from '../../redux/slices/AudioPlayer/state';

const AudioPlayer = () => {
  const dispatch = useDispatch();
  const { visibility } = useSelector(selectAudioPlayerStyle);
  const { isPlaying, currentTime } = useSelector(selectAudioPlayerState);
  const isHidden = visibility === AudioPlayerVisibility.Hidden;
  const isMinimized = visibility === AudioPlayerVisibility.Minimized;
  const isExpanded = visibility === AudioPlayerVisibility.Expanded;
  const audioPlayerEl = useRef(null);
  const audioDuration = audioPlayerEl.current.duration;
  if (audioPlayerEl.current) {
    audioPlayerEl.current.onended = () => setIsPlaying(false); // set playing to false when the audio finishes playing
  }

  // No need to debounce. The frequency is funciton is set by the browser based on the system it's running on
  const onTimeUpdate = () => {
    // update the current audio time in redux
    dispatch({ type: setCurrentTime.type, payload: audioPlayerEl.current.currentTime });
  };

  const setTime = (time) => {
    let newTime = time;

    // upper and lower bound case handling
    if (time < 0) {
      newTime = 0;
    } else if (time > audioDuration) {
      newTime = audioDuration;
    }

    audioPlayerEl.current.currentTime = newTime;
    dispatch({ type: setCurrentTime.type, payload: audioPlayerEl.current.currentTime });
  };

  return (
    <StyledContainer isHidden={isHidden} isMinimized={isMinimized} isExpanded={isExpanded}>
      {/* We have to create an inline audio player and hide it due to limitations of how safari requires a play action to trigger: https://stackoverflow.com/questions/31776548/why-cant-javascript-play-audio-files-on-iphone-safari */}
      <audio
        src="https://server12.mp3quran.net/tnjy/004.mp3"
        style={{ display: 'none' }}
        id="audio-player"
        ref={audioPlayerEl}
        onTimeUpdate={onTimeUpdate}
      />
      {isPlaying ? (
        <button
          onClick={() => {
            audioPlayerEl.current.pause();
            dispatch({ type: setIsPlaying.type, payload: false });
          }}
          type="button"
        >
          pause
        </button>
      ) : (
        <button
          onClick={() => {
            audioPlayerEl.current.play();
            dispatch({ type: setIsPlaying.type, payload: true });
          }}
          type="button"
        >
          play
        </button>
      )}
      <button onClick={() => setTime(audioPlayerEl.current.currentTime - 15)} type="button">
        -15
      </button>
      <button onClick={() => setTime(audioPlayerEl.current.currentTime + 15)} type="button">
        +15
      </button>
      <br />
      {`${currentTime} / ${audioDuration}`}
    </StyledContainer>
  );
};

const StyledContainer = styled.div<{
  isHidden: boolean;
  isMinimized: boolean;
  isExpanded: boolean;
}>`
  position: fixed;
  ${(props) => props.isHidden && `height: 0;`}
  ${(props) => props.isMinimized && `height: ${AUDIO_PLAYER_MINIZED_HEIGHT};`}
  ${(props) => props.isExpanded && `height: ${AUDIO_PLAYER_EXPANDED_HEIGHT};`}
  opacity: ${(props) => (props.isHidden ? 0 : 1)};
  width: 100%;
  bottom: 0;
  text-align: center;
  background: #ffebab;
  transition: ${(props) => props.theme.transitions.regular};
  z-index: ${(props) => props.theme.zIndexes.sticky};
`;
export default AudioPlayer;
