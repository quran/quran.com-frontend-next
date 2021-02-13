import React from 'react';
import { CENTER_VERTICALLY } from 'src/styles/utility';
import styled from 'styled-components';

const LanguageSelector = () => {
  return <Container>English</Container>;
};

const Container = styled.div`
  ${CENTER_VERTICALLY};

  margin-left: ${(props) => props.theme.spacing.xxsmall};

  @media only screen and (min-width: ${(props) => props.theme.breakpoints.tablet}) {
    margin-left: ${(props) => props.theme.spacing.medium};
  }
`;
export default LanguageSelector;
