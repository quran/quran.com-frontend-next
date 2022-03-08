import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './Error.module.scss';

import { OFFLINE_ERROR } from 'src/api';
import Button, { ButtonSize, ButtonType } from 'src/components/dls/Button/Button';
import { RetryIcon } from 'src/components/Icons';

interface Props {
  onRetryClicked: () => void;
  error: Error;
}

const Error: React.FC<Props> = ({ onRetryClicked, error }) => {
  const { t } = useTranslation('common');
  return (
    <div className={styles.container}>
      <p className={styles.text}>
        {error.message !== OFFLINE_ERROR ? t('error.general') : t('error.offline')}
      </p>
      <Button
        prefix={<RetryIcon />}
        size={ButtonSize.Small}
        type={ButtonType.Secondary}
        onClick={onRetryClicked}
      >
        {t('retry')}
      </Button>
    </div>
  );
};

export default Error;
