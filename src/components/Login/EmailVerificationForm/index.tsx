import { FC, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSWRConfig } from 'swr';

import styles from '../VerificationCode/VerificationCode.module.scss';
import VerificationCodeBase from '../VerificationCode/VerificationCodeBase';

import Button, { ButtonShape, ButtonType } from '@/dls/Button/Button';
import Input, { InputType } from '@/dls/Forms/Input';
import { completeSignup, requestVerificationCode } from '@/utils/auth/api';
import { makeUserProfileUrl } from '@/utils/auth/apiPaths';
import { logFormSubmission } from '@/utils/eventLogger';

interface Props {
  onBack?: () => void;
}

const EmailVerificationForm: FC<Props> = ({ onBack }) => {
  const { mutate } = useSWRConfig();
  const { t } = useTranslation('common');
  const [email, setEmail] = useState<string>('');
  const [isEmailSubmitted, setIsEmailSubmitted] = useState(false);
  const [error, setError] = useState<string>();

  const handleSubmitCode = async (code: string) => {
    if (!email) {
      throw new Error('Email is required');
    }

    const response = await completeSignup({ email, verificationCode: code });
    if (!response) {
      throw new Error('Invalid verification code');
    }

    mutate(makeUserProfileUrl());
  };

  const handleResendCode = async () => {
    if (!email) {
      throw new Error('Email is required');
    }

    await requestVerificationCode(email);
  };

  const handleBack = () => {
    setIsEmailSubmitted(false);
    setError(undefined);
    if (onBack) {
      onBack();
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);

    if (!email) {
      setError(t('form.email-required'));
      return;
    }

    try {
      logFormSubmission('email_verification');
      await requestVerificationCode(email);
      setIsEmailSubmitted(true);
    } catch (err) {
      setError(err?.message || t('errors.something-went-wrong'));
    }
  };

  if (!isEmailSubmitted) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>{t('email-verification.email-verification')}</h1>
        <form onSubmit={handleEmailSubmit} className={styles.inputContainer}>
          <Input
            id="email-verification"
            value={email}
            onChange={setEmail}
            placeholder={t('form.email')}
            isRequired
            htmlType="email"
            type={error ? InputType.Error : undefined}
            containerClassName={styles.input}
          />
          {error && <div className={styles.error}>{error}</div>}
          <Button
            type={ButtonType.Primary}
            shape={ButtonShape.Pill}
            className={styles.submitButton}
            htmlType="submit"
          >
            {t('submit')}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <VerificationCodeBase
      email={email}
      onBack={handleBack}
      onResendCode={handleResendCode}
      onSubmitCode={handleSubmitCode}
      titleTranslationKey="check-email-title"
      descriptionTranslationKey="verification-code-sent-to"
      errorTranslationKey="errors.verification-code-invalid"
      formSubmissionKey="email_verification_submit"
      resendClickKey="email_verification_resend"
    />
  );
};

export default EmailVerificationForm;
