import React from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { setIsVisible, selectNotes } from 'src/redux/slices/QuranReader/notes';

const NOTES_WIDTH = '400px';

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
  width: ${(props) => (props.isVisible ? NOTES_WIDTH : 0)};
  position: fixed;
  z-index: 1;
  top: 0;
  right: 0;
  background-color: #2e75ff;
  overflow-x: hidden;
  transition: 0.5s;
`;
export default Notes;
