import React from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import {
  AudioPlayerVisibility,
  selectAudioPlayerStyle,
} from '../../redux/slices/AudioPlayer/style';

const AudioPlayer = () => {
  const { visibility } = useSelector(selectAudioPlayerStyle);
  const isVisible =
    visibility === AudioPlayerVisibility.Expanded || visibility === AudioPlayerVisibility.Minimized;
  const isMinimized = visibility === AudioPlayerVisibility.Minimized;

  return (
    <StyledContainer isVisible={isVisible} isMinimized={isMinimized}>
      [Placeholder AudioPlayer]
    </StyledContainer>
  );
};

const StyledContainer = styled.div<{ isVisible: boolean; isMinimized: boolean }>`
  position: sticky;
  min-height: ${(props) =>
    props.isMinimized
      ? props.theme.spacing.medium
      : `calc(
    ${props.theme.spacing.mega} + ${props.theme.spacing.medium}
  )`};
  visibility: ${(props) => (props.isVisible ? 'visible' : 'hidden')};
  width: 100%;
  bottom: 0;
  text-align: center;
  background: #ffebab;
  transition: ${(props) => props.theme.transitions.regular};
  z-index: ${(props) => props.theme.zIndexes.sticky};
`;
export default AudioPlayer;
