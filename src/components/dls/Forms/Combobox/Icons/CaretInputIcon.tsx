import React from 'react';

import classNames from 'classnames';

import CaretIcon from '../../../../../../public/icons/caret-down.svg';

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
      <CaretIcon />
    </div>
  );
};

export default CaretInputIcon;
