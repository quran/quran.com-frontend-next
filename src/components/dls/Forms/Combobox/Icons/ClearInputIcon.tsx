import React from 'react';

import styles from './ClearInputIcon.module.scss';

import CloseIcon from '@/icons/close.svg';

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
      // eslint-disable-next-line react/no-unknown-property
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
