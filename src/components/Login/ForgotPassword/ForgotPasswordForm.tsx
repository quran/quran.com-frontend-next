import React, { useState } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import AuthHeader from '../AuthHeader';
import styles from '../login.module.scss';
import getFormErrors, { ErrorType } from '../SignUpForm/errors';
import { getEmailField } from '../SignUpFormFields/credentialFields';

import Button, { ButtonShape, ButtonType, ButtonVariant } from '@/components/dls/Button/Button';
import FormBuilder from '@/components/FormBuilder/FormBuilder';
import { FormBuilderFormField } from '@/components/FormBuilder/FormBuilderTypes';
import { useToast, ToastStatus } from '@/dls/Toast/Toast';
import ArrowLeft from '@/icons/west.svg';
import { requestPasswordReset } from '@/utils/auth/authRequests';
import { logButtonClick, logFormSubmission } from '@/utils/eventLogger';
import { getLoginNavigationUrl } from '@/utils/navigation';

const ForgotPasswordForm: React.FC = () => {
  const { t } = useTranslation('login');
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const formFields: FormBuilderFormField[] = [getEmailField(t)];

  const handleSubmit = async (values: { email: string }) => {
    logFormSubmission('forgot_password');
    try {
      setIsSubmitting(true);
      const { data: response, errors } = await requestPasswordReset(values.email);

      if (!response.success) {
        setIsSubmitting(false);
        return getFormErrors(t, ErrorType.API, errors);
      }

      toast(t('forgot-password-success'), { status: ToastStatus.Success });
      router.push(getLoginNavigationUrl());
      return undefined;
    } catch (error) {
      setIsSubmitting(false);
      return getFormErrors(t, ErrorType.FORGOT_PASSWORD);
    }
  };

  const handleBack = () => {
    logButtonClick('forgot_password_back');
    router.push(getLoginNavigationUrl());
  };

  const renderAction = (props) => (
    <Button
      {...props}
      block
      shape={ButtonShape.Pill}
      type={ButtonType.Success}
      className={styles.submitButton}
    >
      {t('confirm')}
    </Button>
  );

  return (
    <div className={styles.outerContainer}>
      <div className={styles.authContainer}>
        <AuthHeader />
        <h1 className={styles.authTitle}>{t('forgot-password-title')}</h1>
        <p className={styles.description}>{t('forgot-password-description')}</p>
        <div className={styles.formContainer}>
          <FormBuilder
            formFields={formFields}
            onSubmit={handleSubmit}
            renderAction={renderAction}
            isSubmitting={isSubmitting}
          />
          <Button variant={ButtonVariant.Compact} onClick={handleBack} isDisabled={isSubmitting}>
            <ArrowLeft /> {t('back')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
