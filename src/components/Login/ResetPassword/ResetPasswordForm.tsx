import React, { useState } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import AuthHeader from '../AuthHeader';
import BackButton from '../BackButton';
import styles from '../login.module.scss';
import getFormErrors, { ErrorType } from '../SignUpForm/errors';
import getPasswordFields from '../SignUpForm/PasswordFields';

import Button, { ButtonShape, ButtonSize, ButtonType } from '@/components/dls/Button/Button';
import FormBuilder from '@/components/FormBuilder/FormBuilder';
import { FormBuilderFormField } from '@/components/FormBuilder/FormBuilderTypes';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import QueryParam from '@/types/QueryParam';
import { resetPassword } from '@/utils/auth/authRequests';
import { logButtonClick, logFormSubmission } from '@/utils/eventLogger';
import { getLoginNavigationUrl } from '@/utils/navigation';

const ResetPasswordForm: React.FC = () => {
  const { t } = useTranslation('login');
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const toast = useToast();
  const token = router.query[QueryParam.TOKEN] as string;

  const formFields: FormBuilderFormField[] = getPasswordFields(
    t,
    'new-password-placeholder',
    'confirm-new-password-placeholder',
  );

  const handleSubmit = async (values: { password: string; confirmPassword: string }) => {
    logFormSubmission('reset_password');
    setGeneralError(null);
    try {
      if (values.password !== values.confirmPassword) {
        return getFormErrors(t, ErrorType.MISMATCH);
      }

      setIsSubmitting(true);
      const { data: response, errors } = await resetPassword(values.password, token);

      if (!response.success) {
        setIsSubmitting(false);
        if (errors.token) {
          setGeneralError(t('errors.expiredRequest'));
        }
        return getFormErrors(t, ErrorType.API, errors);
      }

      toast(t('reset-password-success'), { status: ToastStatus.Success });
      router.push(getLoginNavigationUrl());
      return undefined;
    } catch (error) {
      setIsSubmitting(false);
      return getFormErrors(t, ErrorType.RESET_PASSWORD);
    }
  };

  const handleBack = () => {
    logButtonClick('reset_password_back');
    router.push(getLoginNavigationUrl());
  };

  const renderAction = (props) => (
    <Button
      {...props}
      block
      size={ButtonSize.Small}
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
        <h1 className={styles.authTitle}>{t('set-new-password')}</h1>
        <div className={styles.formContainer}>
          {generalError && <div className={styles.generalError}>{generalError}</div>}

          <FormBuilder
            formFields={formFields}
            onSubmit={handleSubmit}
            renderAction={renderAction}
            isSubmitting={isSubmitting}
          />
          <BackButton onClick={handleBack} />
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
