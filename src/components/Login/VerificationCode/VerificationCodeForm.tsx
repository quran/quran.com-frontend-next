/* eslint-disable react-func/max-lines-per-function */
import { FC } from 'react';

import { useRouter } from 'next/router';

import VerificationCodeBase from './VerificationCodeBase';

import AuthHeader from '@/components/Login/AuthHeader';
import styles from '@/components/Login/login.module.scss';
import SignUpRequest from '@/types/auth/SignUpRequest';
import { signUp } from '@/utils/auth/authRequests';
import { logFormSubmission } from '@/utils/eventLogger';

interface Props {
  email: string;
  onBack: () => void;
  onResendCode: () => Promise<void>;
  signUpData: SignUpRequest;
}

const VerificationCodeForm: FC<Props> = ({ email, onBack, onResendCode, signUpData }) => {
  const router = useRouter();

  const handleSubmitCode = async (code: string) => {
    logFormSubmission('verification_code_submit');
    const { data: response } = await signUp({
      ...signUpData,
      verificationCode: code,
    });

    if (!response.success) {
      throw new Error('Invalid verification code');
    }

    // If successful, redirect back or to home
    const redirectPath = (router.query.redirect as string) || '/';
    router.push(redirectPath);
  };

  return (
    <div className={styles.authContainer}>
      <AuthHeader />
      <VerificationCodeBase
        email={email}
        onBack={onBack}
        onResendCode={onResendCode}
        onSubmitCode={handleSubmitCode}
      />
    </div>
  );
};

export default VerificationCodeForm;
