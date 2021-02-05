import React from 'react';
import { selectContextMenu } from 'src/redux/slices/QuranReader/contextMenu';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { NAVBAR_HEIGHT, NOTES_SIDE_BAR_DESKTOP_WIDTH } from 'src/styles/constants';
import { selectNotes } from 'src/redux/slices/QuranReader/notes';
import { selectNavbar } from 'src/redux/slices/navbar';

const ContextMenu = () => {
  const isSideBarVisible = useSelector(selectNotes).isVisible;
  const { isExpanded } = useSelector(selectContextMenu);
  const isNavbarVisible = useSelector(selectNavbar).isVisible;
  return (
    <Container
      isExpanded={isExpanded}
      isNavbarVisible={isNavbarVisible}
      isSideBarVisible={isSideBarVisible}
    >
      [Placeholder Context Menu]
    </Container>
  );
};

const Container = styled.div<{
  isExpanded: boolean;
  isNavbarVisible: boolean;
  isSideBarVisible: boolean;
}>`
  background: #ffb800;
  text-align: center;
  position: fixed;
  top: ${(props) => (props.isNavbarVisible ? NAVBAR_HEIGHT : '0')};
  transition: ${(props) => props.theme.transitions.regular};
  height: ${(props) => (props.isExpanded ? props.theme.spacing.mega : props.theme.spacing.medium)};
  width: 100%;
  @media only screen and (min-width: ${(props) => props.theme.breakpoints.tablet}) {
    transition: ${(props) => props.theme.transitions.regular};
    margin-right: ${(props) => (props.isSideBarVisible ? NOTES_SIDE_BAR_DESKTOP_WIDTH : 0)};
    ${(props) => props.isSideBarVisible && `width: calc(100% - ${NOTES_SIDE_BAR_DESKTOP_WIDTH})`};
  }
`;

export default ContextMenu;
