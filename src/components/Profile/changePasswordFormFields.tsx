import React from 'react';

import { Translate } from 'next-translate';

import PasswordField from '../Login/SignUpForm/PasswordField';
import PasswordInput from '../Login/SignUpForm/PasswordInput';

import styles from './SharedProfileStyles.module.scss';

import { FormBuilderFormField } from '@/components/FormBuilder/FormBuilderTypes';
import { RuleType } from '@/types/FieldRule';
import { FormFieldType } from '@/types/FormField';
import TEST_IDS from '@/utils/test-ids';

/**
 * Get form fields for the change password form
 * @param {Translate} t - Translation function
 * @returns {FormBuilderFormField[]} Array of form fields
 */
const getChangePasswordFormFields = (t: Translate): FormBuilderFormField[] => [
  {
    field: 'currentPassword',
    type: FormFieldType.Password,
    label: t('common:form.current-password'),
    placeholder: t('login:current-password-placeholder'),
    containerClassName: styles.formInputContainer,
    rules: [
      {
        type: RuleType.Required,
        value: true,
        errorMessage: t('common:errors.required', { fieldName: t('common:form.current-password') }),
      },
    ],
    customRender: ({ value, onChange, placeholder }) => (
      <PasswordInput
        dataTestId={TEST_IDS.AUTH.UPDATE_PROFILE.CURRENT_PASSWORD_INPUT}
        label={t('common:form.current-password')}
        containerClassName={styles.passwordFormInput}
        onChange={onChange}
        value={value}
        placeholder={placeholder}
      />
    ),
  },
  {
    field: 'newPassword',
    type: FormFieldType.Password,
    label: t('common:form.new-password'),
    placeholder: t('login:new-password-placeholder'),
    containerClassName: styles.formInputContainer,
    customRender: ({ value, onChange, placeholder }) => (
      <PasswordField
        dataTestId={TEST_IDS.AUTH.UPDATE_PROFILE.NEW_PASSWORD_INPUT}
        label={t('common:form.new-password')}
        containerClassName={styles.passwordFormInput}
        onChange={onChange}
        value={value}
        placeholder={placeholder}
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
        errorMessage: t('common:errors.required', { fieldName: t('common:form.confirm-password') }),
      },
    ],
    customRender: ({ value, onChange, placeholder }) => (
      <PasswordInput
        dataTestId={TEST_IDS.AUTH.UPDATE_PROFILE.CONFIRM_NEW_PASSWORD_INPUT}
        label={t('common:form.confirm-new-password')}
        containerClassName={styles.passwordFormInput}
        onChange={onChange}
        value={value}
        placeholder={placeholder}
      />
    ),
  },
];

export default getChangePasswordFormFields;
