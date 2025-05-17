/* eslint-disable max-lines */
import React, { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
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
import { getUserProfile, requestVerificationCode } from '@/utils/auth/api';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [formData, setFormData] = useState<FormData>({});
  const [email, setEmail] = useState<string>('');

  const { data: userData } = useSWRImmutable(
    isLoggedIn() ? makeUserProfileUrl() : null,
    getUserProfile,
  );

  const handleSubmit = async (data: FormData) => {
    logFormSubmission('complete_signUp');

    const requiredFieldNames = ['firstName', 'lastName', 'email', 'username'];
    const missingFields = requiredFieldNames.filter((field) => !data[field]);

    if (missingFields.length > 0) {
      const errors = {};
      missingFields.forEach((field) => {
        errors[field] = t('errors.required', { fieldName: t(`form.${field}`) });
      });
      return { errors };
    }

    setIsSubmitting(true);
    try {
      setFormData(data);
      setEmail(data.email);
      await requestVerificationCode(data.email);
      setShowVerification(true);
      setIsSubmitting(false);
      return undefined;
    } catch (err) {
      setIsSubmitting(false);
      return getFormErrors(t, ErrorType.API, err);
    }
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
