import React from 'react';

import RetryIcon from '../../../public/icons/retry.svg';

import styles from './ErrorMessage.module.scss';

import Button, { ButtonSize, ButtonType } from 'src/components/dls/Button/Button';

interface Props {
  onRetryClicked: () => void;
  isError?: boolean;
}

const ErrorMessage: React.FC<Props> = ({ onRetryClicked, isError = true }) => (
  <div className={styles.container}>
    <p className={styles.text}>
      {isError
        ? 'Something went wrong. Please try again.'
        : 'Looks like you lost your connection. Please check it and try again.'}
    </p>
    <Button
      prefix={<RetryIcon />}
      size={ButtonSize.Small}
      type={ButtonType.Secondary}
      onClick={onRetryClicked}
    >
      Retry
    </Button>
  </div>
);

export default ErrorMessage;
