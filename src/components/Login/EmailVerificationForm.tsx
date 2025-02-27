import { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSWRConfig } from 'swr';

import FormBuilder from '../FormBuilder/FormBuilder';
import { FormBuilderFormField } from '../FormBuilder/FormBuilderTypes';

import styles from './CompleteSignupForm.module.scss';
import VerificationCodeBase from './VerificationCode/VerificationCodeBase';

import { completeSignup, requestVerificationCode } from '@/utils/auth/api';
import { makeUserProfileUrl } from '@/utils/auth/apiPaths';
import { logFormSubmission } from '@/utils/eventLogger';

type EmailVerificationFormProps = {
  emailFormField: FormBuilderFormField;
};
type EmailFormData = {
  email: string;
};

const EmailVerificationForm = ({ emailFormField }: EmailVerificationFormProps) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { mutate } = useSWRConfig();
  const [email, setEmail] = useState<string>();
  const { t } = useTranslation('common');

  const onEmailSubmitted = (data: EmailFormData) => {
    logFormSubmission('email_verification');
    requestVerificationCode(data.email);
    setIsSubmitted(true);
    setEmail(data.email);
  };

  const onBack = () => {
    setEmail(undefined);
  };

  const handleResendCode = async () => {
    if (!email) {
      throw new Error('Email is required');
    }

    await requestVerificationCode(email);
  };

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

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{t('email-verification.email-verification')}</h2>
      {isSubmitted ? (
        <VerificationCodeBase
          email={email}
          onBack={onBack}
          onResendCode={handleResendCode}
          onSubmitCode={handleSubmitCode}
          titleTranslationKey="common:email-verification.email-verification"
          descriptionTranslationKey="common:email-verification.email-sent"
          errorTranslationKey="errors.verification-code-invalid"
          formSubmissionKey="email_verification_submit"
          resendClickKey="email_verification_resend"
          shouldShowEmail={false}
        />
      ) : (
        <FormBuilder
          formFields={[emailFormField]}
          onSubmit={onEmailSubmitted}
          actionText={t('submit')}
        />
      )}
    </div>
  );
};

export default EmailVerificationForm;
