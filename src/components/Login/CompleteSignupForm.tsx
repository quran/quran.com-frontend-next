/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable max-lines */
import React, { useContext, useState } from 'react';

import classNames from 'classnames';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch } from 'react-redux';
import { useSWRConfig } from 'swr';

import AuthHeader from './AuthHeader';
import getCompleteSignupFormFields from './CompleteSignupFormFields';
import addCustomRenderToCompleteSignupFormFields from './CompleteSignupFormWithCustomRender';
import styles from './login.module.scss';
import getFormErrors, { ErrorType } from './SignUpForm/errors';
import VerificationCodeForm from './VerificationCode/VerificationCodeForm';

import Button, { ButtonShape, ButtonSize, ButtonType } from '@/components/dls/Button/Button';
import FormBuilder from '@/components/FormBuilder/FormBuilder';
import { logErrorToSentry } from '@/lib/sentry';
import authStyles from '@/styles/auth/auth.module.scss';
import UserProfile from '@/types/auth/UserProfile';
import { makeUserProfileUrl } from '@/utils/auth/apiPaths';
import { updateUserProfile } from '@/utils/auth/authRequests';
import { syncPreferencesFromServer } from '@/utils/auth/syncPreferencesFromServer';
import {
  handleResendVerificationCode,
  handleVerificationCodeSubmit as submitVerificationCode,
} from '@/utils/auth/verification';
import { logFormSubmission } from '@/utils/eventLogger';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';

type FormData = {
  [key: string]: string;
};

interface CompleteSignupFormProps {
  onSuccess?: () => void;
  userData?: UserProfile;
}

const CompleteSignupForm: React.FC<CompleteSignupFormProps> = ({ onSuccess, userData }) => {
  const { t } = useTranslation('common');
  const { mutate } = useSWRConfig();
  const router = useRouter();
  const dispatch = useDispatch();
  const audioService = useContext(AudioPlayerMachineContext);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [formData, setFormData] = useState<FormData>({});
  const [email, setEmail] = useState<string>('');
  const [generalError, setGeneralError] = useState<string | null>(null);

  const validateFormData = (data: FormData) => {
    const requiredFieldNames = ['firstName', 'lastName', 'email', 'username'];
    const missingFields = requiredFieldNames.filter((field) => !data[field]);

    if (missingFields.length > 0) {
      const errors = {};
      missingFields.forEach((field) => {
        errors[field] = t('errors.required', { fieldName: t(`form.${field}`) });
      });
      return { errors };
    }
    return null;
  };

  const handleSubmit = async (data: FormData) => {
    logFormSubmission('complete_signUp');

    // Reset general error state
    setGeneralError(null);

    // Validate form data
    const validationErrors = validateFormData(data);
    if (validationErrors) return validationErrors;

    setIsSubmitting(true);

    try {
      // Update the user profile using the auth request handler
      const { data: response, errors } = await updateUserProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
      });

      if (!response.success) {
        setIsSubmitting(false);
        return getFormErrors(t, ErrorType.API, errors);
      }

      // Don't include email in the mutation if it's missing from the user profile
      // This ensures the profile is still considered incomplete until verification is complete
      const wasEmailMissing = !userData?.email;
      const isEmailAdded = !!data.email;

      // Update the global state with the new profile data
      mutate(
        makeUserProfileUrl(),
        {
          ...userData,
          firstName: data.firstName,
          lastName: data.lastName,
          username: data.username,
          // Only include email if it wasn't missing from the user profile
          ...(!wasEmailMissing && { email: data.email || userData?.email }),
        },
        false,
      );

      // Store form data and email
      setFormData(data);
      setEmail(data.email);

      // Check if email was missing and has been added
      if (wasEmailMissing && isEmailAdded) {
        try {
          // Email was missing and has been added, proceed with verification
          await handleResendVerificationCode(data.email);

          // Show verification form
          setShowVerification(true);
          setIsSubmitting(false);
          return undefined;
        } catch (error) {
          setIsSubmitting(false);
          setGeneralError(t('errors.verification-failed'));
          return { errors: {} };
        }
      }

      // If we reach here, the profile was updated successfully and no verification is needed
      onSuccess?.();
      setIsSubmitting(false);
      return undefined;
    } catch (error) {
      setIsSubmitting(false);
      setGeneralError(t('errors.complete-signup-failed'));
      return { errors: {} };
    }
  };

  const handleVerificationCodeSubmit = async (code: string) => {
    try {
      const result = await submitVerificationCode(email, code);
      try {
        // Persist current settings
        await syncPreferencesFromServer({
          locale: router.locale || 'en',
          dispatch,
          audioService,
        });
      } catch (error) {
        logErrorToSentry('Failed to sync user preferences after verification', error);
      }

      // Mutate the user profile data to update the global state
      mutate(result.profileUrl);

      // Call onSuccess to redirect to home page
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      // Let the VerificationCodeBase component handle the error display
      setIsSubmitting(false);
      throw error;
    }
  };

  const handleBack = () => setShowVerification(false);

  const handleResendCode = async () => {
    await handleResendVerificationCode(email);
  };

  const renderAction = (props) => (
    <Button
      {...props}
      block
      size={ButtonSize.Small}
      shape={ButtonShape.Pill}
      type={ButtonType.Success}
      className={classNames(styles.submitButton, styles.smallMarginTop)}
    >
      {t('continue')}
    </Button>
  );

  // Get the base form fields and add customRender to fields
  const formFields = React.useMemo(() => {
    const baseFields = getCompleteSignupFormFields(t);
    return addCustomRenderToCompleteSignupFormFields(baseFields, userData, formData);
  }, [t, userData, formData]);

  if (showVerification) {
    return (
      <div className={styles.outerContainer}>
        <VerificationCodeForm
          email={email}
          signUpData={formData as any}
          onBack={handleBack}
          onResendCode={handleResendCode}
          onSuccess={onSuccess}
          handleSubmit={handleVerificationCodeSubmit}
        />
      </div>
    );
  }

  return (
    <div className={authStyles.outerContainer}>
      <div className={styles.authContainer}>
        <AuthHeader />
        <h1 className={styles.authTitle}>{t('complete-signup.title')}</h1>
        <p className={styles.description}>{t('complete-signup.description')}</p>
        <div className={styles.formContainer}>
          {generalError && <div className={styles.generalError}>{generalError}</div>}
          {userData && (
            <FormBuilder
              key={userData.id}
              formFields={formFields}
              onSubmit={handleSubmit}
              renderAction={renderAction}
              isSubmitting={isSubmitting}
              shouldSkipValidation
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CompleteSignupForm;
