import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './ConsentBody.module.scss';

import Button, { ButtonType } from '@/dls/Button/Button';

type Props = {
  children: React.ReactNode;
  isLoading?: boolean;
  onSubmitClicked: () => void;
};

const ConsentBody: React.FC<Props> = ({ children, isLoading = false, onSubmitClicked }) => {
  const { t } = useTranslation('common');
  return (
    <div className={styles.container}>
      {children}
      <Button
        isDisabled={isLoading}
        isLoading={isLoading}
        onClick={onSubmitClicked}
        type={ButtonType.Primary}
        className={styles.submitButton}
      >
        {t('submit')}
      </Button>
    </div>
  );
};

export default ConsentBody;
