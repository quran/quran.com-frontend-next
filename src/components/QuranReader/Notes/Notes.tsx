import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setIsVisible, selectNotes } from 'src/redux/slices/QuranReader/notes';
import classNames from 'classnames';
import styles from './Notes.module.scss';

const Notes = () => {
  const dispatch = useDispatch();
  const { isVisible } = useSelector(selectNotes);

  return (
    <div className={classNames(styles.container, { [styles.visibleContainer]: isVisible })}>
      Notes placeholders
      <br />
      <button type="button" onClick={() => dispatch({ type: setIsVisible.type, payload: false })}>
        close
      </button>
    </div>
  );
};

export default Notes;
