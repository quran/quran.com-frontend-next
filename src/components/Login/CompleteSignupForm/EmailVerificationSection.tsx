import { FC } from 'react';

import { useSWRConfig } from 'swr';

import VerificationCodeBase from '../VerificationCode/VerificationCodeBase';

import SignUpRequest from '@/types/auth/SignUpRequest';
import { makeUserProfileUrl } from '@/utils/auth/apiPaths';
import { signUp } from '@/utils/auth/authRequests';

interface Props {
  email: string;
  formData: SignUpRequest;
  onBack: () => void;
  onVerified: () => void;
}

const EmailVerificationSection: FC<Props> = ({ email, formData, onBack, onVerified }) => {
  const { mutate } = useSWRConfig();

  const handleSubmitCode = async (code: string) => {
    const { data: response } = await signUp({
      ...formData,
      verificationCode: code,
    });

    if (!response.success) {
      throw new Error('Invalid verification code');
    }

    mutate(makeUserProfileUrl());
    onVerified();
  };

  const handleResendCode = async () => {
    const { data: response } = await signUp(formData);

    if (!response.success) {
      throw new Error('Failed to resend verification code');
    }
  };

  return (
    <VerificationCodeBase
      email={email}
      onBack={onBack}
      onResendCode={handleResendCode}
      onSubmitCode={handleSubmitCode}
      titleTranslationKey="email-verification.email-verification"
      descriptionTranslationKey="email-verification.email-sent"
      errorTranslationKey="errors.verification-code-invalid"
      formSubmissionKey="email_verification_submit"
      resendClickKey="email_verification_resend"
    />
  );
};

export default EmailVerificationSection;
