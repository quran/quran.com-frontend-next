import React from 'react';

import { Translate } from 'next-translate';

import { NAME_MAX_LENGTH, NAME_MIN_LENGTH } from '../Login/SignUpFormFields/consts';

import styles from './SharedProfileStyles.module.scss';

import { FormBuilderFormField } from '@/components/FormBuilder/FormBuilderTypes';
import { REGEX_NAME } from '@/components/Login/SignUpFormFields/nameFields';
import Input from '@/dls/Forms/Input';
import UserProfile from '@/types/auth/UserProfile';
import { RuleType } from '@/types/FieldRule';
import { FormFieldType } from '@/types/FormField';

/**
 * Get form fields for the edit details form
 * @param {Translate} t - Translation function
 * @param {UserProfile | undefined} userData - User profile data
 * @returns {FormBuilderFormField[]} Array of form fields
 */
const getEditDetailsFormFields = (t: Translate, userData?: UserProfile): FormBuilderFormField[] => [
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
        type: RuleType.MinimumLength,
        value: NAME_MIN_LENGTH,
        errorMessage: t('common:errors.min', {
          fieldName: t('common:form.firstName'),
          min: NAME_MIN_LENGTH,
        }),
      },
      {
        type: RuleType.MaximumLength,
        value: NAME_MAX_LENGTH,
        errorMessage: t('common:errors.max', {
          fieldName: t('common:form.firstName'),
          max: NAME_MAX_LENGTH,
        }),
      },
      {
        type: RuleType.Regex,
        value: REGEX_NAME,
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
        type: RuleType.MinimumLength,
        value: NAME_MIN_LENGTH,
        errorMessage: t('common:errors.min', {
          fieldName: t('common:form.lastName'),
          min: NAME_MIN_LENGTH,
        }),
      },
      {
        type: RuleType.MaximumLength,
        value: NAME_MAX_LENGTH,
        errorMessage: t('common:errors.max', {
          fieldName: t('common:form.lastName'),
          max: NAME_MAX_LENGTH,
        }),
      },
      {
        type: RuleType.Regex,
        value: REGEX_NAME,
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
];

export default getEditDetailsFormFields;
