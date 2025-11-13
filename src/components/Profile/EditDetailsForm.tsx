import { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from '../../pages/profile/profile.module.scss';

import Section from './Section';

import FormBuilder from '@/components/FormBuilder/FormBuilder';
import { FormBuilderFormField } from '@/components/FormBuilder/FormBuilderTypes';
import Button, { ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import Input from '@/dls/Forms/Input';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import useAuthData from '@/hooks/auth/useAuthData';
import useUpdateUserProfile from '@/hooks/auth/useUpdateUserProfile';
import { RuleType } from '@/types/FieldRule';
import { FormFieldType } from '@/types/FormField';

type FormData = {
  firstName: string;
  lastName: string;
};

const EditDetailsForm: React.FC = () => {
  const { t } = useTranslation('profile');
  const { userData } = useAuthData();
  const { updateProfile, isUpdating } = useUpdateUserProfile();
  const toast = useToast();

  const formFields: FormBuilderFormField[] = useMemo(
    () => [
      {
        field: 'email',
        type: FormFieldType.Text,
        label: t('common:form.email'),
        placeholder: t('login:email-placeholder'),
        defaultValue: userData?.email || '',
        containerClassName: styles.formInputContainer,
        customRender: ({ value, placeholder }) => (
          <Input
            id="email"
            label={t('common:form.email')}
            placeholder={placeholder}
            containerClassName={styles.formInput}
            disabled
            value={value}
          />
        ),
      },
      {
        field: 'username',
        type: FormFieldType.Text,
        label: t('common:form.username'),
        placeholder: t('login:username-placeholder'),
        defaultValue: userData?.username || '',
        containerClassName: styles.formInputContainer,
        customRender: ({ value, placeholder }) => (
          <Input
            id="username"
            label={t('common:form.username')}
            placeholder={placeholder}
            containerClassName={styles.formInput}
            disabled
            value={value}
          />
        ),
      },
      {
        field: 'firstName',
        type: FormFieldType.Text,
        label: t('common:form.firstName'),
        placeholder: t('login:first-name-placeholder'),
        defaultValue: userData?.firstName || '',
        containerClassName: styles.formInputContainer,
        rules: [
          {
            type: RuleType.Required,
            value: true,
            errorMessage: t('login:errors.required', { fieldName: t('common:form.firstName') }),
          },
          {
            type: RuleType.Regex,
            value: '^[a-zA-Z]+$',
            errorMessage: t('login:errors.invalid', { fieldName: t('common:form.firstName') }),
          },
        ],
        customRender: ({ value, onChange, placeholder }) => (
          <Input
            id="firstName"
            label={t('common:form.firstName')}
            placeholder={placeholder}
            containerClassName={styles.formInput}
            value={value}
            onChange={onChange}
          />
        ),
      },
      {
        field: 'lastName',
        type: FormFieldType.Text,
        label: t('common:form.lastName'),
        placeholder: t('login:last-name-placeholder'),
        defaultValue: userData?.lastName || '',
        containerClassName: styles.formInputContainer,
        rules: [
          {
            type: RuleType.Required,
            value: true,
            errorMessage: t('login:errors.required', { fieldName: t('common:form.lastName') }),
          },
          {
            type: RuleType.Regex,
            value: '^[a-zA-Z]+$',
            errorMessage: t('login:errors.invalid', { fieldName: t('common:form.lastName') }),
          },
        ],
        customRender: ({ value, onChange, placeholder }) => (
          <Input
            id="lastName"
            label={t('common:form.lastName')}
            placeholder={placeholder}
            containerClassName={styles.formInput}
            value={value}
            onChange={onChange}
          />
        ),
      },
    ],
    [t, userData],
  );

  const onFormSubmit = async (data: FormData) => {
    const result = await updateProfile({
      firstName: data.firstName,
      lastName: data.lastName,
    });

    if (result && 'errors' in result && result.errors) {
      const errorMessages: string[] = [];

      if (result.errors.firstName) {
        const errorMessage = t(result.errors.firstName, {
          fieldName: t('common:form.firstName'),
        });
        errorMessages.push(errorMessage);
      }

      if (result.errors.lastName) {
        const errorMessage = t(result.errors.lastName, {
          fieldName: t('common:form.lastName'),
        });
        errorMessages.push(errorMessage);
      }

      if (errorMessages.length > 0) {
        toast(errorMessages.join(', '), {
          status: ToastStatus.Error,
        });
      }
    }
  };

  const renderAction = (props) => (
    <div>
      <Button
        {...props}
        className={styles.button}
        size={ButtonSize.Small}
        variant={ButtonVariant.Accent}
      >
        {t('save-changes')}
      </Button>
    </div>
  );

  return (
    <Section title={t('edit-details')}>
      <FormBuilder
        key={userData ? `${userData.email}-${userData.firstName}-${userData.lastName}` : 'loading'}
        className={styles.formContainer}
        formFields={formFields}
        onSubmit={onFormSubmit}
        actionText={t('save-changes')}
        isSubmitting={isUpdating}
        renderAction={renderAction}
      />
    </Section>
  );
};

export default EditDetailsForm;
