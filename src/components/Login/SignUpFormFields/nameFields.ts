/* eslint-disable import/prefer-default-export */
/* eslint-disable react-func/max-lines-per-function */
import { NAME_MAX_LENGTH, NAME_MIN_LENGTH } from './consts';

import { FormBuilderFormField } from '@/components/FormBuilder/FormBuilderTypes';
import { RuleType } from '@/types/FieldRule';
import { FormFieldType } from '@/types/FormField';

export const REGEX_NAME = '^[^!"#$%&\'\\*\\+,\\-\\./:;<=>?@\\[\\\\\\]\\^_`{|}~§±×÷]+$';

export const getNameFields = (t: any): FormBuilderFormField[] => [
  {
    field: 'firstName',
    type: FormFieldType.Text,
    placeholder: t('first-name-placeholder'),
    rules: [
      {
        type: RuleType.Required,
        value: true,
        errorMessage: t('errors.required', { fieldName: t('common:form.firstName') }),
      },
      {
        type: RuleType.MinimumLength,
        value: NAME_MIN_LENGTH,
        errorMessage: t('errors.min', {
          fieldName: t('common:form.firstName'),
          min: NAME_MIN_LENGTH,
        }),
      },
      {
        type: RuleType.MaximumLength,
        value: NAME_MAX_LENGTH,
        errorMessage: t('errors.max', {
          fieldName: t('common:form.firstName'),
          max: NAME_MAX_LENGTH,
        }),
      },
      {
        type: RuleType.Regex,
        value: REGEX_NAME,
        errorMessage: t('errors.name', { fieldName: t('common:form.firstName') }),
      },
    ],
  },
  {
    field: 'lastName',
    type: FormFieldType.Text,
    placeholder: t('last-name-placeholder'),
    rules: [
      {
        type: RuleType.Required,
        value: true,
        errorMessage: t('errors.required', { fieldName: t('common:form.lastName') }),
      },
      {
        type: RuleType.MinimumLength,
        value: NAME_MIN_LENGTH,
        errorMessage: t('errors.min', {
          fieldName: t('common:form.lastName'),
          min: NAME_MIN_LENGTH,
        }),
      },
      {
        type: RuleType.MaximumLength,
        value: NAME_MAX_LENGTH,
        errorMessage: t('errors.max', {
          fieldName: t('common:form.lastName'),
          max: NAME_MAX_LENGTH,
        }),
      },
      {
        type: RuleType.Regex,
        value: REGEX_NAME,
        errorMessage: t('errors.name', { fieldName: t('common:form.lastName') }),
      },
    ],
  },
];
