import React from 'react';
import { selectContextMenu } from 'src/redux/slices/QuranReader/contextMenu';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { NOTES_SIDE_BAR_DESKTOP_WIDTH } from 'src/styles/constants';
import { selectNotes } from 'src/redux/slices/QuranReader/notes';

const ContextMenu = () => {
  const isSideBarVisible = useSelector(selectNotes).isVisible;
  const { isExpanded } = useSelector(selectContextMenu);
  return (
    <Container isExpanded={isExpanded} isSideBarVisible={isSideBarVisible}>
      [Placeholder Context Menu]
    </Container>
  );
};

const Container = styled.div<{ isExpanded: boolean; isSideBarVisible: boolean }>`
  background: #ffb800;
  text-align: center;
  transition: ${(props) => props.theme.transitions.regular};
  height: ${(props) => (props.isExpanded ? props.theme.spacing.mega : props.theme.spacing.medium)};
  @media only screen and (min-width: ${(props) => props.theme.breakpoints.tablet}) {
    transition: ${(props) => props.theme.transitions.regular};
    margin-right: ${(props) => (props.isSideBarVisible ? NOTES_SIDE_BAR_DESKTOP_WIDTH : 0)};
  } ;
`;

export default ContextMenu;
