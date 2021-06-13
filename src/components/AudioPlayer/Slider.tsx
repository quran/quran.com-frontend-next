import React, { useMemo } from 'react';
import { secondsFormatter } from 'src/utils/datetime';
import _ from 'lodash';
import styled from 'styled-components';

const NUMBER_OF_SPLITS = 100;

type SliderProps = {
  currentTime: number;
  audioDuration: number;
  seek: (number: number, absoluteTime?: boolean) => void;
  disabled: boolean;
};

/**
 * The slider is divided into {NUMBER_OF_SPLITS} splits. These splits represent
 * the audio playback completion and are used for seeking audio at a particular time.
 */
const Slider = ({ currentTime, audioDuration, seek, disabled }: SliderProps) => {
  const splitDuration = audioDuration / NUMBER_OF_SPLITS;

  const splits = _.range(0, NUMBER_OF_SPLITS).map((index) => {
    const splitStartTime = splitDuration * index;
    const isComplete = currentTime >= splitStartTime;
    return (
      <Split
        disabled={disabled}
        isComplete={isComplete}
        key={index}
        startTime={splitStartTime}
        onClick={() => seek(splitStartTime, true)}
      />
    );
  });

  // memoize this as the audioDuration will not be updated much so no need to compute this on every render.
  const audioDurationFormatted = useMemo(() => secondsFormatter(audioDuration), [audioDuration]);

  return (
    <StyledContainer>
      {secondsFormatter(currentTime)}
      <StyledSplitsContainer>{splits}</StyledSplitsContainer>
      {audioDurationFormatted}
    </StyledContainer>
  );
};

type SplitProps = {
  isComplete: boolean;
  startTime: number;
  onClick: () => void;
  disabled: boolean;
};

const Split = ({ isComplete, startTime, onClick, disabled }: SplitProps) => {
  return (
    <StyledSplit
      disabled={disabled}
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
`;

const StyledSplit = styled.span<{ isComplete: boolean; disabled: boolean }>`
  height: 1px;
  width: ${100 / NUMBER_OF_SPLITS}%;
  cursor: pointer;
  display: inline-block;
  margin-bottom: calc(1.5 * ${({ theme }) => theme.spacing.micro});
  background-color: ${({ isComplete, theme }) =>
    isComplete ? theme.colors.primary.medium : theme.colors.secondary.medium};
  ${(props) =>
    props.disabled &&
    `cursor: default;
    opacity: ${props.theme.opacity[50]};`};
`;

export default Slider;
