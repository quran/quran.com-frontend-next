import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './ConsentBody.module.scss';

import Button, { ButtonType } from '@/dls/Button/Button';

type Props = {
  children: React.ReactNode;
  isLoading?: boolean;
  onButtonClicked: (consented: boolean) => void;
};

const ConsentBody: React.FC<Props> = ({ children, isLoading = false, onButtonClicked }) => {
  const { t } = useTranslation('common');
  return (
    <div className={styles.container}>
      {children}
      <div className={styles.buttonsContainer}>
        <Button
          isDisabled={isLoading}
          isLoading={isLoading}
          onClick={() => {
            onButtonClicked(true);
          }}
          type={ButtonType.Primary}
          className={styles.submitButton}
        >
          {t('allow')}
        </Button>
        <Button
          isDisabled={isLoading}
          isLoading={isLoading}
          onClick={() => {
            onButtonClicked(false);
          }}
          type={ButtonType.Secondary}
          className={styles.submitButton}
        >
          {t('not-now')}
        </Button>
      </div>
    </div>
  );
};

export default ConsentBody;
