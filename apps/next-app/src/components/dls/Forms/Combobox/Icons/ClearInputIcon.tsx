import React from 'react';

import { FiX } from 'react-icons/fi';

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
        <FiX />
      </span>
    </span>
  );
};

export default ClearInputIcon;
