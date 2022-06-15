import { useEffect, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import Button, { ButtonVariant } from '../dls/Button/Button';

import styles from './login.module.scss';

type ResendEmailSectionProps = {
  onResendButtonClicked: () => void;
  initialRemainingTimeInSeconds?: number;
};

const ResendEmailSection = ({
  onResendButtonClicked,
  initialRemainingTimeInSeconds = 60,
}: ResendEmailSectionProps) => {
  const [remainingTimeInSeconds, setRemainingTimeInSeconds] = useState(
    initialRemainingTimeInSeconds,
  );
  const { t } = useTranslation('common');

  const disabled = remainingTimeInSeconds > 0;

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingTimeInSeconds((prevRemainingTime) => {
        if (prevRemainingTime > 0) {
          return prevRemainingTime - 1;
        }
        return prevRemainingTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.resendEmailSection}>
      <div>{t('email-verification.check-spam')}</div>
      <Button
        className={styles.resendButton}
        isDisabled={disabled}
        variant={ButtonVariant.Outlined}
        onClick={onResendButtonClicked}
      >
        {disabled
          ? t('email-verification.resend-email-in', {
              remainingTime: remainingTimeInSeconds,
            })
          : t('email-verification.resend-email')}
      </Button>
    </div>
  );
};

export default ResendEmailSection;
