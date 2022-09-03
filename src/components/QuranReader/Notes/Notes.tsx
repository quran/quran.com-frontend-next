/* eslint-disable i18next/no-literal-string */
import React from 'react';

import classNames from 'classnames';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import styles from './Notes.module.scss';

import { setIsVisible, selectNotes } from '@/redux/slices/QuranReader/notes';

const Notes = () => {
  const dispatch = useDispatch();
  const { isVisible } = useSelector(selectNotes, shallowEqual);

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
