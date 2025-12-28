import { Translate } from 'next-translate';

import PasswordInput from '../Login/SignUpForm/PasswordInput';
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '../Login/SignUpFormFields/consts';

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
const getChangePasswordFormFields = (t: Translate): FormBuilderFormField[] => {
  const newPasswordRules = [
    {
      type: RuleType.MinimumLength,
      value: PASSWORD_MIN_LENGTH,
      errorMessage: t('login:password-rules.min-length'),
    },
    {
      type: RuleType.MaximumLength,
      value: PASSWORD_MAX_LENGTH,
      errorMessage: t('login:password-rules.max-length'),
    },
    {
      type: RuleType.Regex,
      name: 'uppercase',
      value: '[A-Z]',
      errorMessage: t('login:password-rules.uppercase'),
    },
    {
      type: RuleType.Regex,
      name: 'lowercase',
      value: '[a-z]',
      errorMessage: t('login:password-rules.lowercase'),
    },
    {
      type: RuleType.Regex,
      name: 'number',
      value: '[0-9]',
      errorMessage: t('login:password-rules.number'),
    },
    {
      type: RuleType.Regex,
      name: 'special',
      value: '[!@#$%^&*_-]',
      errorMessage: t('login:password-rules.special'),
    },
  ];

  return [
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
          errorMessage: t('common:errors.required', {
            fieldName: t('common:form.current-password'),
          }),
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
      rules: newPasswordRules,
      shouldShowValidationErrors: true,
      customRender: ({ value, onChange, placeholder }) => (
        <PasswordInput
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
          errorMessage: t('common:errors.required', {
            fieldName: t('common:form.confirm-password'),
          }),
        },
        {
          type: RuleType.Equal,
          value: 'newPassword',
          errorMessage: t('common:errors.equal', {
            fieldName: t('common:form.confirm-password'),
          }),
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
};

export default getChangePasswordFormFields;
