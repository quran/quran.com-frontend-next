import { useEffect, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import Button, { ButtonVariant } from '../dls/Button/Button';

import styles from './login.module.scss';

type ResendEmailSectionProps = {
  onResendButtonClicked: () => void;
  initialRemainingTimeInSecond?: number;
};

const ResendEmailSection = ({
  onResendButtonClicked,
  initialRemainingTimeInSecond = 60,
}: ResendEmailSectionProps) => {
  const [remainingTimeInSecond, setRemainingTimeInSecond] = useState(initialRemainingTimeInSecond);
  const { t } = useTranslation('login');

  const disabled = remainingTimeInSecond > 0;

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingTimeInSecond((prevRemainingTime) => {
        if (prevRemainingTime > 0) return prevRemainingTime - 1;
        return prevRemainingTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.resendEmailSection}>
      <div>{t('check-spam')}</div>
      <Button
        className={styles.resendButton}
        isDisabled={disabled}
        variant={ButtonVariant.Outlined}
        onClick={onResendButtonClicked}
      >
        {disabled
          ? t('resend-email-in', {
              remainingTime: remainingTimeInSecond,
            })
          : t('resend-email')}
      </Button>
    </div>
  );
};

export default ResendEmailSection;
