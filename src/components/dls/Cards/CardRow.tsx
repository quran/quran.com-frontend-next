import React, { ReactElement } from 'react';
import styled from 'styled-components';
import { space, MarginProps, PaddingProps } from 'styled-system';

const CardRowContainer = styled.div<MarginProps & PaddingProps>`
  display: grid;
  grid-gap: ${(props) => props.theme.spacing.small};
  grid-template-columns: 0;
  grid-template-rows: auto;
  grid-auto-flow: column;
  grid-auto-columns: auto;

  grid-column: 1 / -1;

  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  overflow-x: scroll;
  scroll-snap-type: x proximity;
  padding-bottom: ${(props) => props.theme.spacing.xsmall};
  margin-bottom: -${(props) => props.theme.spacing.micro};
  ${space}

  &:before,
  &:after {
    content: '';
    width: ${(props) => props.theme.spacing.xsmall};
  }
`;

type CardRowProps = {
  children: ReactElement[];
} & MarginProps &
  PaddingProps;

const CardRow = ({ children, ...props }: CardRowProps) => (
  <CardRowContainer {...props}>{children}</CardRowContainer>
);

export default CardRow;
