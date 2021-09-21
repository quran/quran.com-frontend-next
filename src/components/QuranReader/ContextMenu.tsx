import React, { useCallback } from 'react';

import classNames from 'classnames';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import styles from './ContextMenu.module.scss';

import useScrollDirection, { ScrollDirection } from 'src/hooks/useScrollDirection';
import { selectNavbar } from 'src/redux/slices/navbar';
import { selectContextMenu, setIsExpanded } from 'src/redux/slices/QuranReader/contextMenu';
import { selectNotes } from 'src/redux/slices/QuranReader/notes';
import { selectCurrentlyReadingVerseKey } from 'src/redux/slices/QuranReader/readingContext';

const ContextMenu = () => {
  const dispatch = useDispatch();
  const isSideBarVisible = useSelector(selectNotes, shallowEqual).isVisible;
  const { isExpanded } = useSelector(selectContextMenu, shallowEqual);
  const isNavbarVisible = useSelector(selectNavbar, shallowEqual).isVisible;
  const verseKey = useSelector(selectCurrentlyReadingVerseKey, shallowEqual);
  const onDirectionChange = useCallback(
    (direction: ScrollDirection) => {
      if (direction === ScrollDirection.Up && !isExpanded) {
        dispatch({ type: setIsExpanded.type, payload: true });
      } else if (direction === ScrollDirection.Down && isExpanded) {
        dispatch({ type: setIsExpanded.type, payload: false });
      }
    },
    [dispatch, isExpanded],
  );
  useScrollDirection(onDirectionChange);

  return (
    <div
      className={classNames(styles.container, {
        [styles.visibleContainer]: isNavbarVisible,
        [styles.expandedContainer]: isExpanded,
        [styles.withVisibleSideBar]: isSideBarVisible,
      })}
    >
      {verseKey}
    </div>
  );
};

export default ContextMenu;
