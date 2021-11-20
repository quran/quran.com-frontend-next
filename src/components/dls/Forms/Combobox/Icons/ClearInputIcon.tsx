import React from 'react';

import CloseIcon from '../../../../../../public/icons/close.svg';

import styles from './ClearInputIcon.module.scss';

interface Props {
  shouldShowIcon: boolean;
  onClearButtonClicked: (event: React.MouseEvent<HTMLSpanElement>) => void;
}

const ClearInputIcon: React.FC<Props> = ({ shouldShowIcon, onClearButtonClicked }) => {
  if (!shouldShowIcon) {
    return null;
  }
  return (
    <span
      className={styles.clearIconContainer}
      unselectable="on"
      aria-hidden="true"
      onClick={onClearButtonClicked}
    >
      <span role="img" aria-label="close-circle" className={styles.icon}>
        <CloseIcon />
      </span>
    </span>
  );
};

export default ClearInputIcon;
