import React from 'react';

import { Translate } from 'next-translate';

import PasswordField from '../Login/SignUpForm/PasswordField';
import PasswordInput from '../Login/SignUpForm/PasswordInput';
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '../Login/SignUpFormFields/consts';

import styles from './SharedProfileStyles.module.scss';

import { FormBuilderFormField } from '@/components/FormBuilder/FormBuilderTypes';
import { RuleType } from '@/types/FieldRule';
import { FormFieldType } from '@/types/FormField';

/**
 * Get form fields for the change password form
 * @param {Translate} t - Translation function
 * @param {boolean} canUpdatePassword - Whether the user can update their password
 * @returns {FormBuilderFormField[]} Array of form fields
 */
const getChangePasswordFormFields = (
  t: Translate,
  canUpdatePassword: boolean,
): FormBuilderFormField[] => [
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
        label={t('common:form.current-password')}
        containerClassName={styles.passwordFormInput}
        onChange={onChange}
        value={value}
        placeholder={placeholder}
        isDisabled={!canUpdatePassword}
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
        errorMessage: t('common:errors.required', { fieldName: t('common:form.password') }),
      },
      {
        type: RuleType.MinimumLength,
        value: PASSWORD_MIN_LENGTH,
        errorMessage: t('common:errors.min', {
          fieldName: t('common:form.password'),
          min: PASSWORD_MIN_LENGTH,
        }),
      },
      {
        type: RuleType.MaximumLength,
        value: PASSWORD_MAX_LENGTH,
        errorMessage: t('common:errors.max', {
          fieldName: t('common:form.password'),
          max: PASSWORD_MAX_LENGTH,
        }),
      },
    ],
    customRender: ({ value, onChange, placeholder }) => (
      <PasswordField
        label={t('common:form.new-password')}
        containerClassName={styles.passwordFormInput}
        onChange={onChange}
        value={value}
        placeholder={placeholder}
        isDisabled={!canUpdatePassword}
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
        label={t('common:form.confirm-new-password')}
        containerClassName={styles.passwordFormInput}
        onChange={onChange}
        value={value}
        placeholder={placeholder}
        isDisabled={!canUpdatePassword}
      />
    ),
  },
];

export default getChangePasswordFormFields;
