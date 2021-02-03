import React from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
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
  position: sticky;
  ${(props) => props.isHidden && `height: 0;`}
  ${(props) => props.isMinimized && `height: ${props.theme.spacing.medium};`}
  ${(props) =>
    props.isExpanded &&
    `height: calc(
    ${props.theme.spacing.mega} + ${props.theme.spacing.medium}
  );`}
  opacity: ${(props) => (props.isHidden ? 0 : 1)};
  width: 100%;
  bottom: 0;
  text-align: center;
  background: #ffebab;
  transition: ${(props) => props.theme.transitions.regular};
  z-index: ${(props) => props.theme.zIndexes.sticky};
`;
export default AudioPlayer;
