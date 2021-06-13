import React, { useRef } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import {
  AUDIO_PLAYER_EXPANDED_HEIGHT,
  AUDIO_PLAYER_MINIMIZED_HEIGHT,
  MAX_AUDIO_PLAYER_WIDTH,
} from 'src/styles/constants';
import { CENTER_HORIZONTALLY } from 'src/styles/utility';
import {
  AudioPlayerVisibility,
  selectAudioPlayerStyle,
} from '../../redux/slices/AudioPlayer/style';
import PlayIcon from '../../../public/icons/play-circle-outline.svg';
import useAudioPlayer from '../../hooks/useAudioPlayer';
import PauseIcon from '../../../public/icons/pause-circle-outline.svg';
import MinusTenIcon from '../../../public/icons/minus-ten.svg';
import PlusTenIcon from '../../../public/icons/forward_10.svg';
import Button, { ButtonSize } from '../dls/Button/Button';
import Slider from './Slider';
import AudioKeyBoardListeners from './AudioKeyboardListeners';
import { FAILURE, LOADING, PLAYING, READY } from './States';

const AudioPlayer = () => {
  const { visibility } = useSelector(selectAudioPlayerStyle);
  const { currentState, canPlay, fail, updateTiming, end, toggle, seek, stall } = useAudioPlayer();
  const { elapsed, duration } = currentState.context;
  const isPlaying = currentState.matches(`${READY}.${PLAYING}`);
  const disableControls = currentState.matches(FAILURE) || currentState.matches(LOADING);
  const isHidden = visibility === AudioPlayerVisibility.Hidden;
  const isMinimized = visibility === AudioPlayerVisibility.Minimized;
  const isExpanded = visibility === AudioPlayerVisibility.Expanded;
  const audioPlayerEl = useRef(null);

  return (
    <StyledContainer isHidden={isHidden} isMinimized={isMinimized} isExpanded={isExpanded}>
      <StyledInnerContainer>
        {/* We have to create an inline audio player and hide it due to limitations of how safari requires a play action to trigger: https://stackoverflow.com/questions/31776548/why-cant-javascript-play-audio-files-on-iphone-safari */}
        <audio
          src="https://server12.mp3quran.net/tnjy/004.mp3"
          style={{ display: 'none' }}
          id="audio-player"
          ref={audioPlayerEl}
          onCanPlay={() => {
            canPlay(audioPlayerEl.current);
          }}
          onTimeUpdate={() => {
            updateTiming();
          }}
          onEnded={() => {
            end();
          }}
          onError={() => {
            fail();
          }}
          onStalled={() => {
            stall();
          }}
        />
        <AudioKeyBoardListeners seek={seek} togglePlaying={toggle} disabled={disableControls} />
        <ActionButtonsContainers>
          <Button
            icon={isPlaying ? <PauseIcon /> : <PlayIcon />}
            disabled={disableControls}
            size={ButtonSize.Medium}
            onClick={() => {
              toggle();
            }}
          />
          <Button
            disabled={disableControls}
            icon={<MinusTenIcon />}
            size={ButtonSize.Medium}
            onClick={() => seek(-10)}
          />
          <Button
            icon={<PlusTenIcon />}
            size={ButtonSize.Medium}
            onClick={() => seek(10)}
            disabled={disableControls}
          />
        </ActionButtonsContainers>
        <SliderContainer>
          <Slider
            currentTime={elapsed}
            audioDuration={duration}
            seek={seek}
            disabled={disableControls}
          />
        </SliderContainer>
      </StyledInnerContainer>
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
  ${(props) => props.isMinimized && `height: ${AUDIO_PLAYER_MINIMIZED_HEIGHT};`}
  ${(props) => props.isExpanded && `height: ${AUDIO_PLAYER_EXPANDED_HEIGHT};`}
  opacity: ${(props) => (props.isHidden ? 0 : 1)};
  width: 100%;
  bottom: 0;
  text-align: center;
  background: ${({ theme }) => theme.colors.background.neutralGrey};
  transition: ${(props) => props.theme.transitions.regular};
  z-index: ${(props) => props.theme.zIndexes.sticky};
`;

const StyledInnerContainer = styled.div`
  max-width: ${MAX_AUDIO_PLAYER_WIDTH};
  ${CENTER_HORIZONTALLY}
  display: flex;
  justify-content: space-around;
`;

const ActionButtonsContainers = styled.div`
  margin-top: ${({ theme }) => theme.spacing.micro};
`;

const SliderContainer = styled.div`
  width: 70%;
`;
export default AudioPlayer;
