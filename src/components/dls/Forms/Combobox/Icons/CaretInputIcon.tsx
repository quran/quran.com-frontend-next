import React from 'react';

import classNames from 'classnames';

import styles from './CaretInputIcon.module.scss';

import { CaretDownIcon } from 'src/components/Icons';

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
      <CaretDownIcon />
    </div>
  );
};

export default CaretInputIcon;
