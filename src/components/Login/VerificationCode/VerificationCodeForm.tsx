/* eslint-disable react-func/max-lines-per-function */
import { FC, useContext } from 'react';

import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';

import VerificationCodeBase from './VerificationCodeBase';

import AuthHeader from '@/components/Login/AuthHeader';
import styles from '@/components/Login/login.module.scss';
import useAuthRedirect from '@/hooks/auth/useAuthRedirect';
import { persistCurrentSettings } from '@/redux/slices/defaultSettings';
import SignUpRequest from '@/types/auth/SignUpRequest';
import { signUp } from '@/utils/auth/authRequests';
import { syncPreferencesFromServer } from '@/utils/auth/syncPreferencesFromServer';
import { logFormSubmission } from '@/utils/eventLogger';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';

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
  const dispatch = useDispatch<any>();
  const audioService = useContext(AudioPlayerMachineContext);

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

    try {
      await dispatch(persistCurrentSettings());
    } catch (persistError) {
      // eslint-disable-next-line no-console
      console.error('Failed to persist current settings after verification', {
        error: persistError,
        timestamp: new Date().toISOString(),
      });
    }

    let targetLocale = router.locale || 'en';
    try {
      const { appliedLocale } = await syncPreferencesFromServer({
        locale: targetLocale,
        dispatch,
        audioService,
      });
      if (appliedLocale) {
        targetLocale = appliedLocale;
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to sync user preferences after verification', error);
    }

    // If successful, call onSuccess callback or redirect
    if (onSuccess) {
      onSuccess();
    } else {
      // Default behavior: redirect back or to home
      redirectWithToken((router.query.redirect as string) || '/', response?.token, targetLocale);
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
