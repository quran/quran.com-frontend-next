/* eslint-disable react-func/max-lines-per-function */
import { FC, useEffect, useState } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import VerificationInput from 'react-verification-input';

import styles from './VerificationCode.module.scss';

import {
  VERIFICATION_CODE_LENGTH,
  RESEND_COOLDOWN_SECONDS,
} from '@/components/Login/SignUpFormFields/consts';
import Button, { ButtonShape, ButtonType } from '@/dls/Button/Button';
import { useToast } from '@/dls/Toast/Toast';
import SignUpRequest from '@/types/auth/SignUpRequest';
import { signUp } from '@/utils/auth/authRequests';

interface Props {
  email: string;
  onBack: () => void;
  onResendCode: () => Promise<void>;
  signUpData: SignUpRequest;
}

const VerificationCodeForm: FC<Props> = ({ email, onBack, onResendCode, signUpData }) => {
  const { t } = useTranslation('login');
  const router = useRouter();
  const showToast = useToast();
  const [resendTimer, setResendTimer] = useState(0);
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSubmit = async (code: string) => {
    setError('');
    if (!signUpData) {
      setError(t('errors.verification-code-invalid'));
      return;
    }

    try {
      const { data: response } = await signUp({
        ...signUpData,
        verificationCode: code,
      });

      if (!response.success) {
        setError(t('errors.verification-code-invalid'));
        return;
      }

      // If successful, redirect back or to home
      const redirectPath = (router.query.redirect as string) || '/';
      router.push(redirectPath);
    } catch (err) {
      setError(t('errors.verification-code-invalid'));
    }
  };

  const handleChange = (code: string) => {
    setVerificationCode(code);
    if (code.length === VERIFICATION_CODE_LENGTH) {
      handleSubmit(code);
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0) return;

    try {
      await onResendCode();
      setResendTimer(RESEND_COOLDOWN_SECONDS);
      setVerificationCode(''); // Clear the input on resend
      showToast(t('verification-code-sent'));
    } catch (err) {
      showToast(t('errors.verification-resend-failed'));
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{t('check-email-title')}</h1>
      <div className={styles.emailContainer}>
        <p className={styles.description}>{t('verification-code-sent-to')}</p>
        <p className={styles.email}>{email}</p>
      </div>
      <p className={styles.instruction}>{t('verification-code-instruction')}</p>

      <div className={styles.inputContainer}>
        <VerificationInput
          value={verificationCode}
          onChange={handleChange}
          length={VERIFICATION_CODE_LENGTH}
          inputProps={{ inputMode: 'numeric' }}
          validChars="0-9"
          autoFocus
          classNames={{
            character: styles.character,
            container: styles.verificationContainer,
            characterInactive: styles.characterInactive,
            characterSelected: styles.characterSelected,
          }}
        />
        {error && <div className={styles.error}>{error}</div>}
      </div>

      <div className={styles.spamNote}>{t('verification-code-spam-note')}</div>

      <div className={styles.actions}>
        <Button
          type={ButtonType.Secondary}
          shape={ButtonShape.Pill}
          onClick={handleResendCode}
          isDisabled={resendTimer > 0}
          className={styles.resendButton}
        >
          {resendTimer > 0
            ? t('verification-code-resend-countdown', { seconds: resendTimer })
            : t('verification-code-resend')}
        </Button>

        <Button
          type={ButtonType.Primary}
          shape={ButtonShape.Pill}
          onClick={onBack}
          className={styles.backButton}
        >
          {t('back')}
        </Button>
      </div>
    </div>
  );
};

export default VerificationCodeForm;
