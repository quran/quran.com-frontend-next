import React from 'react';

import classNames from 'classnames';

import { FiChevronDown } from 'react-icons/fi';

import styles from './CaretInputIcon.module.scss';

interface Props {
  shouldShowIcon: boolean;
  isOpened: boolean;
}

const CaretInputIcon: React.FC<Props> = ({ shouldShowIcon, isOpened }) => {
  if (!shouldShowIcon) {
    return null;
  }
  return (
    <div
      className={classNames(styles.caretIconButton, {
        [styles.openedCaretIconButton]: isOpened,
      })}
      aria-label="Show more"
    >
      <FiChevronDown />
    </div>
  );
};

export default CaretInputIcon;
