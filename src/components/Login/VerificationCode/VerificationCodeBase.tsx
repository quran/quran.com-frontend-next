import { FC, useEffect, useState } from 'react';

import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';
import VerificationInput from 'react-verification-input';

import styles from './VerificationCode.module.scss';

import {
  VERIFICATION_CODE_LENGTH,
  RESEND_COOLDOWN_SECONDS,
} from '@/components/Login/SignUpFormFields/consts';
import Button, { ButtonType, ButtonVariant } from '@/dls/Button/Button';
import { useToast } from '@/dls/Toast/Toast';
import ArrowLeft from '@/icons/west.svg';
import { logButtonClick, logFormSubmission } from '@/utils/eventLogger';

interface Props {
  email: string;
  onBack: () => void;
  onResendCode: () => Promise<void>;
  onSubmitCode: (code: string) => Promise<void>;
  titleTranslationKey?: string;
  descriptionTranslationKey?: string;
  errorTranslationKey?: string;
  formSubmissionKey?: string;
  resendClickKey?: string;
  shouldShowEmail?: boolean;
}

const VerificationCodeBase: FC<Props> = ({
  email,
  onBack,
  onResendCode,
  onSubmitCode,
  titleTranslationKey = 'check-email-title',
  descriptionTranslationKey = 'login:verification-code-sent-to',
  errorTranslationKey = 'errors.verification-code-invalid',
  formSubmissionKey = 'verification_code_submit',
  resendClickKey = 'verification_code_resend',
  shouldShowEmail = true,
}) => {
  const { t } = useTranslation('login');
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
    logFormSubmission(formSubmissionKey);
    setError('');

    try {
      await onSubmitCode(code);
    } catch (err) {
      setError(t(errorTranslationKey));
    }
  };

  const handleChange = (code: string) => {
    setVerificationCode(code);
    if (code.length === VERIFICATION_CODE_LENGTH) {
      handleSubmit(code);
    }
  };

  const handleResendCode = async () => {
    logButtonClick(resendClickKey);
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
      <h1 className={styles.title}>{t(titleTranslationKey)}</h1>
      <div className={styles.emailContainer}>
        <p className={styles.description}>
          <Trans
            i18nKey={descriptionTranslationKey}
            values={{ email }}
            components={{
              strong: <strong className={styles.confirmationText} />,
            }}
          />
        </p>
        {shouldShowEmail && <p className={styles.email}>{email}</p>}
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
          variant={ButtonVariant.Simplified}
          onClick={handleResendCode}
          isDisabled={resendTimer > 0}
          className={styles.resendButton}
        >
          {resendTimer > 0
            ? t('verification-code-resend-countdown', { seconds: resendTimer })
            : t('verification-code-resend')}
        </Button>

        <Button variant={ButtonVariant.Compact} onClick={onBack} className={styles.backButton}>
          <ArrowLeft /> {t('back')}
        </Button>
      </div>
    </div>
  );
};

export default VerificationCodeBase;
