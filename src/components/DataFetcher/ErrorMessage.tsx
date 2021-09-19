import React from 'react';

import RetryIcon from '../../../public/icons/retry.svg';

import styles from './ErrorMessage.module.scss';

import { OFFLINE_ERROR } from 'src/api';
import Button, { ButtonSize, ButtonType } from 'src/components/dls/Button/Button';

interface Props {
  onRetryClicked: () => void;
  error: Error;
}

const ErrorMessage: React.FC<Props> = ({ onRetryClicked, error }) => (
  <div className={styles.container}>
    <p className={styles.text}>
      {error.message !== OFFLINE_ERROR
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
