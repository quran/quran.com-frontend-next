import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectNotes, setIsVisible } from 'src/redux/slices/QuranReader/notes';

const NotesAdjustment = () => {
  const dispatch = useDispatch();
  const { isVisible } = useSelector(selectNotes);
  return (
    <div>
      Notes{' '}
      <button
        type="button"
        onClick={() => dispatch({ type: setIsVisible.type, payload: !isVisible })}
      >
        Toggle notes
      </button>
    </div>
  );
};

export default NotesAdjustment;
