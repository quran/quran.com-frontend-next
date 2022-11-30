import React from 'react';

import classNames from 'classnames';

import styles from './CaretInputIcon.module.scss';

import CaretIcon from '@/icons/caret-down.svg';

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
      <CaretIcon />
    </div>
  );
};

export default CaretInputIcon;
