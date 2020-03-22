import React from 'react';
import styled from 'styled-components';
import { Container } from 'styled-bootstrap-grid';
import Logo from './Logo';
import { IoIosSearch, IoIosAdd } from 'react-icons/io';

const Nav = styled.nav`
  position: relative;
  display: -ms-flexbox;
  display: flex;
  -ms-flex-wrap: wrap;
  flex-wrap: wrap;
  -ms-flex-align: center;
  align-items: center;
  -ms-flex-pack: justify;
  justify-content: space-between;
  padding: 1.75rem 0rem;
`;

const NavMenu = styled.ul`
  display: flex;
  -ms-flex-direction: column;
  flex-direction: column;
  padding-left: 0;
  margin-bottom: 0;
  list-style: none;
  flex-direction: row;
`;

const NavMenuItem = styled.li`
  display: list-item;
  text-align: -webkit-match-parent;
`;
const NavMenuItemLink = styled.a`
  display: block;
  padding: 0.5rem 1rem;
  color: #000;
`;

const Brand = styled.a`
  display: inline-block;
  padding-top: 0.3125rem;
  padding-bottom: 0.3125rem;
  margin-right: 1rem;
  font-size: 1.25rem;
  line-height: inherit;
  white-space: nowrap;
`;

const Navbar = () => (
  <Container>
    <Nav>
      <Brand href="#">
        <Logo />
      </Brand>

      <NavMenu>
        <NavMenuItem>
          <NavMenuItemLink href="#">
            <IoIosSearch size={24} />
          </NavMenuItemLink>
        </NavMenuItem>
        <NavMenuItem>
          <NavMenuItemLink href="#">
            <IoIosAdd size={24} />
          </NavMenuItemLink>
        </NavMenuItem>
      </NavMenu>
    </Nav>
  </Container>
);

export default Navbar;
