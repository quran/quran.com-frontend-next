import React, { useState } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import getFormErrors, { ErrorType } from '../SignUpForm/errors';
import { getEmailField } from '../SignUpFormFields/credentialFields';

import Button, { ButtonShape, ButtonType, ButtonVariant } from '@/components/dls/Button/Button';
import FormBuilder from '@/components/FormBuilder/FormBuilder';
import { FormBuilderFormField } from '@/components/FormBuilder/FormBuilderTypes';
import { useToast, ToastStatus } from '@/dls/Toast/Toast';
import authStyles from '@/styles/auth/auth.module.scss';
import { requestPasswordReset } from '@/utils/auth/authRequests';
import { getLoginNavigationUrl } from '@/utils/navigation';

const ForgotPasswordForm: React.FC = () => {
  const { t } = useTranslation('login');
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const formFields: FormBuilderFormField[] = [getEmailField(t)];

  const handleSubmit = async (values: { email: string }) => {
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
    router.push(getLoginNavigationUrl());
  };

  const renderAction = (props) => (
    <Button
      {...props}
      block
      shape={ButtonShape.Pill}
      type={ButtonType.Success}
      className={authStyles.submitButton}
    >
      {t('reset-password')}
    </Button>
  );

  return (
    <div className={authStyles.outerContainer}>
      <div className={authStyles.innerContainer}>
        <h1 className={authStyles.title}>{t('forgot-password-title')}</h1>
        <p className={authStyles.description}>{t('forgot-password-description')}</p>
        <div className={authStyles.formContainer}>
          <FormBuilder
            formFields={formFields}
            onSubmit={handleSubmit}
            renderAction={renderAction}
            isSubmitting={isSubmitting}
          />
          <Button
            variant={ButtonVariant.Outlined}
            shape={ButtonShape.Pill}
            className={authStyles.backButton}
            onClick={handleBack}
            isDisabled={isSubmitting}
          >
            {t('back-to-login')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
