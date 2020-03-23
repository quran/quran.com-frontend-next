import React, { useState } from 'react';
import styled from 'styled-components';
import { Container, media } from 'styled-bootstrap-grid';
import { IoIosSearch, IoIosAdd, IoIosClose } from 'react-icons/io';
import Modal from 'styled-react-modal';
import Logo from './Logo';
import NewPostform from './NewPostForm';

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

const StyledModal = Modal.styled`
  opacity: ${(props) => props.opacity};
  transition: opacity ease 500ms;
`;

const ModalBody = styled.div`
  background: #dddddd;
  width: 100%;
  margin-left: auto;
  padding: 2rem 2.5rem;

  ${media.lg`
    width: 50%;
  `}
`;

const ModalContainer = styled(Container)`
  position: absolute;
  top: 0px;
  right: 0px;
  left: 0px;
`;

const ModalHeader = styled.div`
  margin-bottom: 5.5rem;
`;

const Navbar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <>
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
              <NavMenuItemLink href="#" onClick={() => setIsModalOpen(true)}>
                <IoIosAdd size={24} />
              </NavMenuItemLink>
            </NavMenuItem>
          </NavMenu>
        </Nav>
      </Container>
      <StyledModal
        isOpen={isModalOpen}
        onBackgroundClick={handleCloseModal}
        onEscapeKeydown={handleCloseModal}
      >
        <ModalContainer>
          <ModalBody>
            <ModalHeader>
              <IoIosClose size={24} onClick={handleCloseModal} />
            </ModalHeader>
            <NewPostform onCloseModal={handleCloseModal} />
          </ModalBody>
        </ModalContainer>
      </StyledModal>
    </>
  );
};

export default Navbar;
