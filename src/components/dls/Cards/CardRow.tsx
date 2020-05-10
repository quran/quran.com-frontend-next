import React, { ReactElement } from 'react';
import styled from 'styled-components';
import { media } from 'styled-bootstrap-grid';
import { space, MarginProps, PaddingProps } from 'styled-system';

const CardRowContainer = styled.div<MarginProps & PaddingProps>`
  display: grid;
  grid-gap: 0.75rem;
  grid-template-columns: 0px;
  grid-template-rows: auto;
  grid-auto-flow: column;
  grid-auto-columns: auto;

  grid-column: 1 / -1;

  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  ${media.xs`
    grid-auto-columns: calc(100% - 0.75rem * 3);
  `}

  overflow-x: scroll;
  scroll-snap-type: x proximity;
  padding-bottom: calc(0.75 * 0.75rem);
  margin-bottom: calc(-0.25 * 0.75rem);
  ${space}

  &:before,
  &:after {
    content: '';
    width: 10px;
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
