/* eslint-disable max-lines */
import React, { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSWRConfig } from 'swr';
import useSWRImmutable from 'swr/immutable';

import AuthHeader from './AuthHeader';
import getCompleteSignupFormFields from './CompleteSignupFormFields';
import addCustomRenderToCompleteSignupFormFields from './CompleteSignupFormWithCustomRender';
import styles from './login.module.scss';
import getFormErrors, { ErrorType } from './SignUpForm/errors';
import VerificationCodeForm from './VerificationCode/VerificationCodeForm';

import Button, { ButtonShape, ButtonType } from '@/components/dls/Button/Button';
import FormBuilder from '@/components/FormBuilder/FormBuilder';
import authStyles from '@/styles/auth/auth.module.scss';
import {
  completeSignup,
  getUserProfile,
  requestVerificationCode,
  updateUserProfile,
} from '@/utils/auth/api';
import { makeUserProfileUrl } from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';
import { logFormSubmission } from '@/utils/eventLogger';

type FormData = {
  [key: string]: string;
};

interface CompleteSignupFormProps {
  onSuccess?: () => void;
}

const CompleteSignupForm: React.FC<CompleteSignupFormProps> = ({ onSuccess }) => {
  const { t } = useTranslation('common');
  const { mutate } = useSWRConfig();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [formData, setFormData] = useState<FormData>({});
  const [email, setEmail] = useState<string>('');

  const { data: userData } = useSWRImmutable(
    isLoggedIn() ? makeUserProfileUrl() : null,
    getUserProfile,
  );

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

  const updateUserProfileData = async (data: FormData) => {
    try {
      await updateUserProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
      });

      mutate(makeUserProfileUrl());
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const sendVerificationCodeToEmail = async (emailAddress: string) => {
    try {
      await requestVerificationCode(emailAddress);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const handleSubmit = async (data: FormData) => {
    logFormSubmission('complete_signUp');

    const validationErrors = validateFormData(data);
    if (validationErrors) return validationErrors;

    setIsSubmitting(true);

    // Update user profile
    const profileResult = await updateUserProfileData(data);
    if (!profileResult.success) {
      setIsSubmitting(false);
      return getFormErrors(t, ErrorType.API, profileResult.error);
    }

    // Store form data and email
    setFormData(data);
    setEmail(data.email);

    // Check if email was missing and has been added
    const wasEmailMissing = !userData?.email;
    const isEmailAdded = !!data.email;

    if (wasEmailMissing && isEmailAdded) {
      // Email was missing and has been added, proceed with verification
      const verificationResult = await sendVerificationCodeToEmail(data.email);
      if (!verificationResult.success) {
        setIsSubmitting(false);
        return getFormErrors(t, ErrorType.API, verificationResult.error);
      }

      // Show verification form
      setShowVerification(true);
      setIsSubmitting(false);
      return undefined;
    }

    // Email wasn't changed or wasn't missing, just redirect
    setIsSubmitting(false);
    // Call onSuccess to redirect to home page
    if (onSuccess) {
      onSuccess();
    }
    return undefined;
  };

  const handleVerificationCodeSubmit = async (code: string) => {
    if (!email) {
      throw new Error('Email is required');
    }

    const response = await completeSignup({ email, verificationCode: code });
    if (!response) {
      throw new Error('Invalid verification code');
    }

    mutate(makeUserProfileUrl());
  };

  const handleBack = () => setShowVerification(false);

  const handleResendCode = async () => {
    if (!email) throw new Error('Email is required');
    await requestVerificationCode(email);
  };

  const renderAction = (props) => (
    <Button
      {...props}
      block
      shape={ButtonShape.Pill}
      type={ButtonType.Success}
      className={styles.submitButton}
    >
      {t('continue')}
    </Button>
  );

  const formFields = React.useMemo(
    () => addCustomRenderToCompleteSignupFormFields(getCompleteSignupFormFields(t), userData),
    [t, userData],
  );

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
          {userData && (
            <FormBuilder
              key={userData.id}
              formFields={formFields}
              onSubmit={handleSubmit}
              renderAction={renderAction}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CompleteSignupForm;
