import { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from '../../pages/profile/profile.module.scss';
import PasswordField from '../Login/SignUpForm/PasswordField';
import PasswordInput from '../Login/SignUpForm/PasswordInput';
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '../Login/SignUpFormFields/consts';

import Section from './Section';

import FormBuilder from '@/components/FormBuilder/FormBuilder';
import { FormBuilderFormField } from '@/components/FormBuilder/FormBuilderTypes';
import Button, { ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import useAuthData from '@/hooks/auth/useAuthData';
import useUpdatePassword from '@/hooks/auth/useUpdatePassword';
import { RuleType } from '@/types/FieldRule';
import { FormFieldType } from '@/types/FormField';

type FormData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const ChangePasswordForm: React.FC = () => {
  const { t } = useTranslation('profile');
  const { userData } = useAuthData();
  const { updatePassword, isUpdating } = useUpdatePassword();
  const toast = useToast();

  const formFields: FormBuilderFormField[] = useMemo(
    () => [
      {
        field: 'currentPassword',
        type: FormFieldType.Password,
        label: t('common:form.current-password'),
        placeholder: t('login:current-password-placeholder'),
        containerClassName: styles.formInputContainer,
        customRender: ({ value, onChange, placeholder }) => (
          <PasswordInput
            containerClassName={styles.passwordFormInput}
            onChange={onChange}
            value={value}
            placeholder={placeholder}
            isDisabled={userData?.isPasswordSet}
          />
        ),
      },
      {
        field: 'newPassword',
        type: FormFieldType.Password,
        label: t('common:form.new-password'),
        placeholder: t('login:new-password-placeholder'),
        containerClassName: styles.formInputContainer,
        rules: [
          {
            type: RuleType.Required,
            value: true,
            errorMessage: t('errors.required', { fieldName: t('common:form.password') }),
          },
          {
            type: RuleType.MinimumLength,
            value: PASSWORD_MIN_LENGTH,
            errorMessage: t('errors.min', {
              fieldName: t('common:form.password'),
              min: PASSWORD_MIN_LENGTH,
            }),
          },
          {
            type: RuleType.MaximumLength,
            value: PASSWORD_MAX_LENGTH,
            errorMessage: t('errors.max', {
              fieldName: t('common:form.password'),
              max: PASSWORD_MAX_LENGTH,
            }),
          },
        ],
        customRender: ({ value, onChange, placeholder }) => (
          <PasswordField
            containerClassName={styles.passwordFormInput}
            onChange={onChange}
            value={value}
            placeholder={placeholder}
            isDisabled={userData?.isPasswordSet}
          />
        ),
      },
      {
        field: 'confirmPassword',
        type: FormFieldType.Password,
        label: t('common:form.confirm-new-password'),
        placeholder: t('login:confirm-new-password-placeholder'),
        containerClassName: styles.formInputContainer,
        rules: [
          {
            type: RuleType.Required,
            value: true,
            errorMessage: t('errors.required', { fieldName: t('common:form.confirm-password') }),
          },
        ],
        customRender: ({ value, onChange, placeholder }) => (
          <PasswordInput
            containerClassName={styles.passwordFormInput}
            onChange={onChange}
            value={value}
            placeholder={placeholder}
            isDisabled={userData?.isPasswordSet}
          />
        ),
      },
    ],
    [t, userData?.isPasswordSet],
  );

  const handleFormErrors = (errors: Record<string, string>) => {
    const errorMessages: string[] = [];

    if (errors.currentPassword) {
      const errorMessage = t(errors.currentPassword, {
        fieldName: t('common:form.current-password'),
      });
      errorMessages.push(errorMessage);
    }

    if (errors.newPassword) {
      const errorMessage = t(errors.newPassword, {
        fieldName: t('common:form.new-password'),
      });
      errorMessages.push(errorMessage);
    }

    if (errors.confirmPassword) {
      const errorMessage = t(errors.confirmPassword, {
        fieldName: t('common:form.confirm-new-password'),
      });
      errorMessages.push(errorMessage);
    }

    if (errorMessages.length > 0) {
      toast(errorMessages.join(', '), {
        status: ToastStatus.Error,
      });
    }
  };

  const onFormSubmit = async (data: FormData) => {
    if (userData?.isPasswordSet) return;
    const result = await updatePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword,
    });

    if (result && 'errors' in result && result.errors) {
      handleFormErrors(result.errors);
    }
  };

  const renderAction = (props) => (
    <div>
      <Button
        {...props}
        className={styles.button}
        size={ButtonSize.Small}
        variant={ButtonVariant.Accent}
        isDisabled={userData?.isPasswordSet}
      >
        {t('update-password')}
      </Button>
    </div>
  );

  return (
    <Section title={t('change-password')}>
      <FormBuilder
        className={styles.passwordFormContainer}
        formFields={formFields}
        onSubmit={onFormSubmit}
        actionText={t('update-password')}
        isSubmitting={isUpdating}
        renderAction={renderAction}
        shouldSkipValidation
      />
    </Section>
  );
};

export default ChangePasswordForm;
