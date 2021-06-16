import React from 'react';
import { secondsFormatter } from 'src/utils/datetime';
import _ from 'lodash';
import styled from 'styled-components';
import { AUDIO_PLAYER_EXPANDED_HEIGHT } from 'src/styles/constants';

const NUMBER_OF_SPLITS = 100;

type SliderProps = {
  currentTime: number;
  audioDuration: number;
  setTime: (number) => void;
};

/**
 * The slider is divided into {NUMBER_OF_SPLITS} splits. These splits represent
 * the audio playback completion and are used for seeking audio at a particular time.
 */
const Slider = ({ currentTime, audioDuration, setTime }: SliderProps) => {
  const splitDuration = audioDuration / NUMBER_OF_SPLITS;

  const splits = _.range(0, NUMBER_OF_SPLITS).map((index) => {
    const splitStartTime = splitDuration * index;
    const isComplete = currentTime >= splitStartTime;
    return (
      <Split
        isComplete={isComplete}
        key={index}
        startTime={splitStartTime}
        onClick={() => setTime(splitStartTime)}
      />
    );
  });

  return (
    <StyledContainer>
      {secondsFormatter(currentTime)}
      <StyledSplitsContainer>{splits}</StyledSplitsContainer>
      {secondsFormatter(audioDuration)}
    </StyledContainer>
  );
};

type SplitProps = {
  isComplete: boolean;
  startTime: number;
  onClick: () => void;
};

const Split = ({ isComplete, startTime, onClick }: SplitProps) => {
  return (
    <StyledSplit
      isComplete={isComplete}
      title={secondsFormatter(startTime)}
      onClick={() => onClick()}
    />
  );
};

const StyledContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing.medium};
`;

const StyledSplitsContainer = styled.div`
  display: inline-block;
  width: 70%;
  margin-left: ${({ theme }) => theme.spacing.medium};
  margin-right: ${({ theme }) => theme.spacing.medium};

  @media only screen and (max-width: ${({ theme }) => theme.breakpoints.mobileL}) {
    position: fixed;
    bottom: ${AUDIO_PLAYER_EXPANDED_HEIGHT};
    left: 0;
    width: 100%;
    margin: 0;
    height: calc(1.25 * ${({ theme }) => theme.spacing.xxsmall});
    /* display: none; */
  }
`;

const StyledSplit = styled.span<{ isComplete: boolean }>`
  height: 2px;
  width: ${100 / NUMBER_OF_SPLITS}%;
  cursor: pointer;
  display: inline-block;
  margin-bottom: calc(1.5 * ${({ theme }) => theme.spacing.micro});
  background-color: ${({ isComplete, theme }) =>
    isComplete ? theme.colors.primary.medium : theme.colors.secondary.medium};
`;

export default Slider;
