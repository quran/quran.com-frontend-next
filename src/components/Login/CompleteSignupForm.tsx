/* eslint-disable max-lines */
import React, { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSWRConfig } from 'swr';

import AuthHeader from './AuthHeader';
import getCompleteSignupFormFields from './CompleteSignupFormFields';
import addCustomRenderToCompleteSignupFormFields from './CompleteSignupFormWithCustomRender';
import styles from './login.module.scss';
import getFormErrors, { ErrorType } from './SignUpForm/errors';
import VerificationCodeForm from './VerificationCode/VerificationCodeForm';

import Button, { ButtonShape, ButtonType } from '@/components/dls/Button/Button';
import FormBuilder from '@/components/FormBuilder/FormBuilder';
import authStyles from '@/styles/auth/auth.module.scss';
import { updateUserProfile } from '@/utils/auth/api';
import { makeUserProfileUrl } from '@/utils/auth/apiPaths';
import {
  handleResendVerificationCode,
  handleVerificationCodeSubmit as submitVerificationCode,
} from '@/utils/auth/verification';
import { logFormSubmission } from '@/utils/eventLogger';
import UserProfile from 'types/auth/UserProfile';

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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [formData, setFormData] = useState<FormData>({});
  const [email, setEmail] = useState<string>('');

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

  /**
   * Updates the user profile data and manages state accordingly
   * @param {FormData} data - Form data to update the profile with
   * @returns {Promise<{success: boolean, error?: any}>} Result of the update operation
   */
  const updateUserProfileData = async (data: FormData) => {
    try {
      // Update the user profile
      await updateUserProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
      });

      // Don't include email in the mutation if it's missing from the user profile
      // This ensures the profile is still considered incomplete until verification is complete
      const wasEmailMissing = !userData?.email;

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

      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  /**
   * Sends a verification code to the specified email address
   * @param {string} emailAddress - Email address to send the verification code to
   * @returns {Promise<{success: boolean, error?: any}>} Result of the send operation
   */
  const sendVerificationCodeToEmail = async (emailAddress: string) => {
    try {
      await handleResendVerificationCode(emailAddress);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  /**
   * Handles the form submission
   * @param {FormData} data - Form data submitted by the user
   * @returns {Promise<any>} Form errors or undefined if successful
   */
  const handleSubmit = async (data: FormData) => {
    logFormSubmission('complete_signUp');

    // Validate form data
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
    if (onSuccess) {
      onSuccess();
    }
    return undefined;
  };

  /**
   * Handles the verification code submission
   * @param {string} code - Verification code entered by the user
   */
  const handleVerificationCodeSubmit = async (code: string) => {
    const result = await submitVerificationCode(email, code);

    // Mutate the user profile data to update the global state
    mutate(result.profileUrl);

    // Call onSuccess to redirect to home page
    if (onSuccess) {
      onSuccess();
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
      shape={ButtonShape.Pill}
      type={ButtonType.Success}
      className={styles.submitButton}
    >
      {t('continue')}
    </Button>
  );

  /**
   * Create form fields with form data passed directly to the custom render function
   * This ensures that form data is prioritized over user data when displaying fields
   */
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
