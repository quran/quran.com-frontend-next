import React from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { AUDIO_PLAYER_EXPANDED_HEIGHT, AUDIO_PLAYER_MINIZED_HEIGHT } from 'src/styles/constants';
import {
  AudioPlayerVisibility,
  selectAudioPlayerStyle,
} from '../../redux/slices/AudioPlayer/style';

const AudioPlayer = () => {
  const { visibility } = useSelector(selectAudioPlayerStyle);
  const isHidden = visibility === AudioPlayerVisibility.Hidden;
  const isMinimized = visibility === AudioPlayerVisibility.Minimized;
  const isExpanded = visibility === AudioPlayerVisibility.Expanded;

  return (
    <StyledContainer isHidden={isHidden} isMinimized={isMinimized} isExpanded={isExpanded}>
      [Placeholder AudioPlayer]
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
