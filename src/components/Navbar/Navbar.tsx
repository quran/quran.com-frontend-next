import React from 'react';
import { NAVBAR_HEIGHT } from 'src/styles/constants';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { selectNavbar } from 'src/redux/slices/navbar';

const Navbar = () => {
  const { isVisible } = useSelector(selectNavbar);
  return <StyledNav isVisible={isVisible}>[Placeholder Navbar]</StyledNav>;
};

const StyledNav = styled.nav<{ isVisible: boolean }>`
  position: relative;
  visibility: ${(props) => (props.isVisible ? 'visible' : 'hidden')};
  min-height: ${NAVBAR_HEIGHT};
  width: 100%;
  text-align: center;
  background: ${(props) => props.theme.colors.background.default};
  z-index: ${(props) => props.theme.zIndexes.header};
  border-bottom: 1px black solid;
`;
export default Navbar;
