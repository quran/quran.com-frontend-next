/* eslint-disable react-func/max-lines-per-function */
import { FC } from 'react';

import { useRouter } from 'next/router';

import VerificationCodeBase from './VerificationCodeBase';

import AuthHeader from '@/components/Login/AuthHeader';
import styles from '@/components/Login/login.module.scss';
import useAuthRedirect from '@/hooks/auth/useAuthRedirect';
import SignUpRequest from '@/types/auth/SignUpRequest';
import { signUp } from '@/utils/auth/authRequests';
import { logFormSubmission } from '@/utils/eventLogger';

interface Props {
  email: string;
  onBack: () => void;
  onResendCode: () => Promise<void>;
  signUpData: SignUpRequest;
  onSuccess?: () => void;
  handleSubmit?: (code: string) => Promise<void>;
}

const VerificationCodeForm: FC<Props> = ({
  email,
  onBack,
  onResendCode,
  signUpData,
  onSuccess,
  handleSubmit,
}) => {
  const router = useRouter();

  const { redirectWithToken } = useAuthRedirect();
  const handleSubmitCode = async (code: string): Promise<void> => {
    logFormSubmission('verification_code_submit');

    const { data: response, errors } = await signUp({
      ...signUpData,
      verificationCode: code,
    });

    if (!response.success) {
      // Throw error to be caught by the VerificationCodeBase component
      throw new Error(errors?.verificationCode || 'Invalid verification code');
    }

    // If successful, call onSuccess callback or redirect
    if (onSuccess) {
      onSuccess();
    } else {
      // Default behavior: redirect back or to home
      redirectWithToken((router.query.redirect as string) || '/', response?.token);
    }
  };

  return (
    <div className={styles.authContainer}>
      <AuthHeader />
      <VerificationCodeBase
        email={email}
        onBack={onBack}
        onResendCode={onResendCode}
        onSubmitCode={handleSubmit || handleSubmitCode}
      />
    </div>
  );
};

export default VerificationCodeForm;
