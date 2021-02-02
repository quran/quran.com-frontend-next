import React from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { setIsVisible, selectNotes } from 'src/redux/slices/QuranReader/notes';
import { NAVBAR_HEIGHT, NOTES_SIDE_BAR_DESKTOP_WIDTH } from 'src/styles/constants';

const Notes = () => {
  const dispatch = useDispatch();
  const { isVisible } = useSelector(selectNotes);

  return (
    <Container isVisible={isVisible}>
      Notes placeholders
      <br />
      <button type="button" onClick={() => dispatch({ type: setIsVisible.type, payload: false })}>
        close
      </button>
    </Container>
  );
};

const Container = styled.div<{ isVisible: boolean }>`
  height: 100%;
  width: ${(props) => (props.isVisible ? `calc(100% - (2*${props.theme.spacing.mega}))` : 0)};
  position: fixed;
  z-index: ${(props) => props.theme.zIndexes.default};
  top: 0;
  padding-top: ${NAVBAR_HEIGHT};
  right: 0;
  background-color: #2e75ff;
  overflow-x: hidden;
  transition: ${(props) => props.theme.transitions.regular};

  @media only screen and (min-width: ${(props) => props.theme.breakpoints.tablet}) {
    width: ${(props) => (props.isVisible ? NOTES_SIDE_BAR_DESKTOP_WIDTH : 0)};
  } ;
`;
export default Notes;
