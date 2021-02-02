import React from 'react';
import { NAVBAR_HEIGHT } from 'src/styles/constants';
import styled from 'styled-components';

const Navbar = () => {
  return <StyledNav>[Placeholder Navbar]</StyledNav>;
};

const StyledNav = styled.nav`
  position: relative;
  min-height: ${NAVBAR_HEIGHT};
  width: 100%;
  text-align: center;
  background: ${(props) => props.theme.colors.background.default};
  z-index: ${(props) => props.theme.zIndexes.header};
  border-bottom: 1px black solid;
`;
export default Navbar;
