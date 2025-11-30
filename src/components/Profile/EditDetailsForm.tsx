/* eslint-disable max-lines */
import { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from '../../pages/profile/profile.module.scss';

import Section from './Section';

import FormBuilder from '@/components/FormBuilder/FormBuilder';
import { FormBuilderFormField } from '@/components/FormBuilder/FormBuilderTypes';
import Button, { ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import Input from '@/dls/Forms/Input';
import useAuthData from '@/hooks/auth/useAuthData';
import useUpdateUserProfile from '@/hooks/auth/useUpdateUserProfile';
import useTransformFormErrors from '@/hooks/useTransformFormErrors';
import { RuleType } from '@/types/FieldRule';
import { FormFieldType } from '@/types/FormField';
import { logButtonClick } from '@/utils/eventLogger';

type FormData = {
  firstName: string;
  lastName: string;
};

const EditDetailsForm: React.FC = () => {
  const { t } = useTranslation('profile');
  const { userData } = useAuthData();
  const { updateProfile, isUpdating } = useUpdateUserProfile();
  const { transformErrors } = useTransformFormErrors<FormData>({
    firstName: {
      fieldNameKey: 'common:form.firstName',
    },
    lastName: {
      fieldNameKey: 'common:form.lastName',
    },
  });

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
            errorMessage: t('common:errors.required', { fieldName: t('common:form.firstName') }),
          },
          {
            type: RuleType.Regex,
            value: '^[a-zA-Z]+$',
            errorMessage: t('common:errors.invalid', { fieldName: t('common:form.firstName') }),
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
            errorMessage: t('common:errors.required', { fieldName: t('common:form.lastName') }),
          },
          {
            type: RuleType.Regex,
            value: '^[a-zA-Z]+$',
            errorMessage: t('common:errors.invalid', { fieldName: t('common:form.lastName') }),
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
    logButtonClick('profile_save_changes');
    const result = await updateProfile({
      firstName: data.firstName,
      lastName: data.lastName,
    });

    return transformErrors(result);
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
