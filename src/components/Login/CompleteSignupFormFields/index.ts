import { FormBuilderFormField } from '@/components/FormBuilder/FormBuilderTypes';
import { RuleType } from '@/types/FieldRule';
import { FormFieldType } from 'types/FormField';

// Simple email validation regex
const EMAIL_REGEX = '.+@.+..+';
// Username validation regex
const USERNAME_REGEX = '^[a-zA-Z0-9_]+$';

/**
 * Get the first name field
 * @param {any} t - Translation function
 * @returns {FormBuilderFormField} First name form field
 */
const getFirstNameField = (t: any): FormBuilderFormField => ({
  field: 'firstName',
  type: FormFieldType.Text,
  placeholder: t('form.firstName'),
  label: t('form.firstName'),
  rules: [
    {
      type: RuleType.Required,
      value: true,
      errorMessage: t('errors.required', { fieldName: t('form.firstName') }),
    },
  ],
});

/**
 * Get the last name field
 * @param {any} t - Translation function
 * @returns {FormBuilderFormField} Last name form field
 */
const getLastNameField = (t: any): FormBuilderFormField => ({
  field: 'lastName',
  type: FormFieldType.Text,
  placeholder: t('form.lastName'),
  label: t('form.lastName'),
  rules: [
    {
      type: RuleType.Required,
      value: true,
      errorMessage: t('errors.required', { fieldName: t('form.lastName') }),
    },
  ],
});

/**
 * Get the email field
 * @param {any} t - Translation function
 * @returns {FormBuilderFormField} Email form field
 */
const getEmailField = (t: any): FormBuilderFormField => ({
  field: 'email',
  type: FormFieldType.Text,
  placeholder: t('form.email'),
  label: t('form.email'),
  rules: [
    {
      type: RuleType.Required,
      value: true,
      errorMessage: t('errors.required', { fieldName: t('form.email') }),
    },
    {
      type: RuleType.Regex,
      value: EMAIL_REGEX,
      errorMessage: t('errors.email'),
    },
  ],
});

/**
 * Get the username field
 * @param {any} t - Translation function
 * @returns {FormBuilderFormField} Username form field
 */
const getUsernameField = (t: any): FormBuilderFormField => ({
  field: 'username',
  type: FormFieldType.Text,
  placeholder: t('form.username'),
  label: t('form.username'),
  rules: [
    {
      type: RuleType.Required,
      value: true,
      errorMessage: t('errors.required', { fieldName: t('form.username') }),
    },
    {
      type: RuleType.Regex,
      value: USERNAME_REGEX,
      errorMessage: t('errors.username'),
    },
  ],
});

/**
 * Get the complete signup form fields
 * @param {any} t - Translation function
 * @returns {FormBuilderFormField[]} Array of form fields
 */
const getCompleteSignupFormFields = (t: any): FormBuilderFormField[] => [
  getFirstNameField(t),
  getLastNameField(t),
  getEmailField(t),
  getUsernameField(t),
];

export default getCompleteSignupFormFields;
