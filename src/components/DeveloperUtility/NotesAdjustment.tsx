import React from 'react';
import { useDispatch } from 'react-redux';
import { setIsVisible } from 'src/redux/slices/QuranReader/notes';

const NotesAdjustment = () => {
  const dispatch = useDispatch();
  return (
    <div>
      <button type="button" onClick={() => dispatch({ type: setIsVisible.type, payload: true })}>
        Show notes
      </button>
    </div>
  );
};

export default NotesAdjustment;
