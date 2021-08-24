import React from 'react';
import { selectContextMenu } from 'src/redux/slices/QuranReader/contextMenu';
import { useSelector } from 'react-redux';
import { selectNotes } from 'src/redux/slices/QuranReader/notes';
import { selectNavbar } from 'src/redux/slices/navbar';
import classNames from 'classnames';
import styles from './ContextMenu.module.scss';

const ContextMenu = () => {
  const isSideBarVisible = useSelector(selectNotes).isVisible;
  const { isExpanded } = useSelector(selectContextMenu);
  const isNavbarVisible = useSelector(selectNavbar).isVisible;
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
