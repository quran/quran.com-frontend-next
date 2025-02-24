/* eslint-disable react-func/max-lines-per-function */
import { USERNAME_MAX_LENGTH, USERNAME_MIN_LENGTH } from './consts';

import { FormBuilderFormField } from '@/components/FormBuilder/FormBuilderTypes';
import { RuleType } from '@/types/FieldRule';
import { FormFieldType } from '@/types/FormField';

const EMAIL_REGEX =
  '^(([^<>()[\\]\\\\.,;:\\s@"]+(\\.[^<>()[\\]\\\\.,;:\\s@"]+)*)|(".+"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\])|(([a-zA-Z0-9]+(-[a-zA-Z0-9]+)*\\.)+[a-zA-Z]{2,}))$';

export const REGEX_USERNAME = '^[a-zA-Z0-9_]+$';

export const getEmailField = (t: any): FormBuilderFormField => ({
  field: 'email',
  type: FormFieldType.Text,
  placeholder: t('email-placeholder'),
  rules: [
    {
      type: RuleType.Required,
      value: true,
      errorMessage: t('errors.required', { fieldName: t('common:form.email') }),
    },
    {
      type: RuleType.Regex,
      value: EMAIL_REGEX,
      errorMessage: t('errors.email'),
    },
  ],
});

export const getUsernameField = (t: any): FormBuilderFormField => ({
  field: 'username',
  type: FormFieldType.Text,
  placeholder: t('username-placeholder'),
  rules: [
    {
      type: RuleType.Required,
      value: true,
      errorMessage: t('errors.required', { fieldName: t('common:form.username') }),
    },
    {
      type: RuleType.MinimumLength,
      value: USERNAME_MIN_LENGTH,
      errorMessage: t('errors.min', {
        fieldName: t('common:form.username'),
        min: USERNAME_MIN_LENGTH,
      }),
    },
    {
      type: RuleType.MaximumLength,
      value: USERNAME_MAX_LENGTH,
      errorMessage: t('errors.max', {
        fieldName: t('common:form.username'),
        max: USERNAME_MAX_LENGTH,
      }),
    },
    {
      type: RuleType.Regex,
      value: REGEX_USERNAME,
      errorMessage: t('errors.username', { fieldName: t('common:form.username') }),
    },
  ],
});
