/* eslint-disable i18next/no-literal-string */
import React from 'react';

import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import { selectNotes, setIsVisible } from '@/redux/slices/QuranReader/notes';

const NotesAdjustment = () => {
  const dispatch = useDispatch();
  const { isVisible } = useSelector(selectNotes, shallowEqual);
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
