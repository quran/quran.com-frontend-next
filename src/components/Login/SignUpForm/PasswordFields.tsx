import { FC } from 'react';

import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '../SignUpFormFields/consts';

import ConfirmPasswordField from './ConfirmPasswordField';
import PasswordField from './PasswordField';

import { FormBuilderFormField } from '@/components/FormBuilder/FormBuilderTypes';
import { RuleType } from '@/types/FieldRule';
import { FormFieldType } from '@/types/FormField';

const getPasswordFields = (
  t: any,
  passwordPlaceholderKey = 'password-placeholder',
  confirmPasswordPlaceholderKey = 'confirm-password-placeholder',
): FormBuilderFormField[] => {
  const PasswordInput: FC<{
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  }> = ({ value, onChange, placeholder }) => (
    <PasswordField value={value} onChange={onChange} placeholder={placeholder} />
  );

  return [
    {
      field: 'password',
      type: FormFieldType.Password,
      placeholder: t(passwordPlaceholderKey),
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
      customRender: PasswordInput,
    },
    {
      field: 'confirmPassword',
      type: FormFieldType.Password,
      placeholder: t(confirmPasswordPlaceholderKey),
      rules: [
        {
          type: RuleType.Required,
          value: true,
          errorMessage: t('errors.required', { fieldName: t('common:form.confirm-password') }),
        },
      ],
      customRender: ConfirmPasswordField,
    },
  ];
};

export default getPasswordFields;
