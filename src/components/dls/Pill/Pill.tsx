import React from 'react';
import styled from 'styled-components';
import { rgba } from 'polished';

const PillContainer = styled.div`
  position: relative;
  cursor: pointer;
  display: inline-block;
  overflow: hidden;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  border-radius: calc(
    ${(props) => props.theme.spacing.large} + ${(props) => props.theme.spacing.xxsmall}
  );
  background: ${({ theme }) => rgba(theme.colors.primary.medium, 0.15)};
  border: 1px solid ${({ theme }) => rgba(theme.colors.primary.medium, 0.5)};
  padding: ${(props) => props.theme.spacing.small} ${(props) => props.theme.spacing.mega};
  color: ${({ theme }) => theme.colors.primary.medium};

  &:hover {
    background: ${({ theme }) => theme.colors.primary.medium};
    color: ${({ theme }) => theme.colors.primary.deep};
  }
`;

const Pill = ({ title }) => <PillContainer>{title}</PillContainer>;

export default Pill;
