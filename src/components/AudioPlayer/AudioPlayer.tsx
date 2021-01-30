import React from 'react';
import styled from 'styled-components';

const AudioPlayer = () => {
  return <StyledContainer>[Placeholder AudioPlayer]</StyledContainer>;
};

const StyledContainer = styled.div`
  position: sticky;
  min-height: calc(
    ${(props) => props.theme.spacing.mega} + ${(props) => props.theme.spacing.medium}
  );
  width: 100%;
  bottom: 0;
  text-align: center;
  background: #ffebab;
`;
export default AudioPlayer;
