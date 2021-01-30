import React from 'react';
import styled from 'styled-components';

const Navbar = () => {
  return <StyledNav>[Placeholder Navbar]</StyledNav>;
};

const StyledNav = styled.nav`
  position: relative;
  min-height: calc(
    ${(props) => props.theme.spacing.mega} + ${(props) => props.theme.spacing.large}
  );
  width: 100%;
  text-align: center;
  border-bottom: 1px black solid;
`;
export default Navbar;
