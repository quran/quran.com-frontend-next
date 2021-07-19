import React, { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { NOTES_SIDE_BAR_DESKTOP_WIDTH } from 'src/styles/constants';
import { selectNotes } from 'src/redux/slices/QuranReader/notes';
import styled from 'styled-components';
import Notes from './Notes/Notes';
import ContextMenu from './ContextMenu';

interface Props {
  children: ReactNode | ReactNode[];
}

const ReaderContainer: React.FC<Props> = ({ children }) => {
  const isSideBarVisible = useSelector(selectNotes).isVisible;
  return (
    <>
      <ContextMenu />
      <Container isSideBarVisible={isSideBarVisible}>{children}</Container>
      <Notes />
    </>
  );
};

const Container = styled.div<{ isSideBarVisible: boolean }>`
  padding-top: calc(3 * ${(props) => props.theme.spacing.mega});
  @media only screen and (min-width: ${(props) => props.theme.breakpoints.tablet}) {
    transition: ${(props) => props.theme.transitions.regular};
    margin-right: ${(props) => (props.isSideBarVisible ? NOTES_SIDE_BAR_DESKTOP_WIDTH : 0)};
  } ;
`;

export default ReaderContainer;
