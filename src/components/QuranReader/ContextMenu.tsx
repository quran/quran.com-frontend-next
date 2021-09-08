import React, { useCallback } from 'react';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { selectContextMenu, setIsExpanded } from 'src/redux/slices/QuranReader/contextMenu';
import { selectNotes } from 'src/redux/slices/QuranReader/notes';
import { selectNavbar } from 'src/redux/slices/navbar';
import useScrollDirection, { ScrollDirection } from 'src/hooks/useScrollDirection';
import styles from './ContextMenu.module.scss';

const ContextMenu = () => {
  const dispatch = useDispatch();
  const isSideBarVisible = useSelector(selectNotes).isVisible;
  const { isExpanded } = useSelector(selectContextMenu);
  const isNavbarVisible = useSelector(selectNavbar).isVisible;
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
      [Placeholder Context Menu]
    </div>
  );
};

export default ContextMenu;
