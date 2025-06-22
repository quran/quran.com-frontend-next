import {
  EMAIL_REGEX,
  getEmailField as getOriginalEmailField,
  getUsernameField as getOriginalUsernameField,
} from '../SignUpFormFields/credentialFields';
import { getNameFields } from '../SignUpFormFields/nameFields';

import { FormBuilderFormField } from '@/components/FormBuilder/FormBuilderTypes';
import { RuleType } from '@/types/FieldRule';

/**
 * Creates a modified field with updated properties for the complete signup form
 * @param {FormBuilderFormField} field - The original field
 * @param {any} t - Translation function
 * @param {object} overrides - Optional properties to override
 * @returns {FormBuilderFormField} The modified field
 */
const createModifiedField = (
  field: FormBuilderFormField,
  t: any,
  overrides: Partial<FormBuilderFormField> = {},
): FormBuilderFormField => {
  // Create a deep copy of the field
  const modifiedField = { ...field };

  // Update label and placeholder to use the form namespace
  modifiedField.label = t(`form.${field.field}`);
  modifiedField.placeholder = t(`form.${field.field}`);

  // Apply any additional overrides
  return { ...modifiedField, ...overrides };
};

/**
 * Get the first name field from nameFields
 * @param {any} t - Translation function
 * @returns {FormBuilderFormField} First name form field
 */
const getFirstNameField = (t: any): FormBuilderFormField => {
  const nameFields = getNameFields(t);
  const firstName = nameFields.find((field) => field.field === 'firstName');

  if (!firstName) {
    throw new Error('First name field not found in nameFields');
  }

  // Modify the field for complete signup form - preserve original rules
  return createModifiedField(firstName, t);
};

/**
 * Get the last name field from nameFields
 * @param {any} t - Translation function
 * @returns {FormBuilderFormField} Last name form field
 */
const getLastNameField = (t: any): FormBuilderFormField => {
  const nameFields = getNameFields(t);
  const lastName = nameFields.find((field) => field.field === 'lastName');

  if (!lastName) {
    throw new Error('Last name field not found in nameFields');
  }

  // Modify the field for complete signup form - preserve original rules
  return createModifiedField(lastName, t);
};

/**
 * Get the email field from credentialFields
 * @param {any} t - Translation function
 * @returns {FormBuilderFormField} Email form field
 */
const getEmailField = (t: any): FormBuilderFormField => {
  const originalEmail = getOriginalEmailField(t);

  // Modify the field for complete signup form
  const modifiedEmail = createModifiedField(originalEmail, t);

  // Update only the regex validation rule to use the simpler pattern
  modifiedEmail.rules = modifiedEmail.rules.map((rule) => {
    if (rule.type === RuleType.Regex) {
      return { ...rule, value: EMAIL_REGEX };
    }
    return rule;
  });

  return modifiedEmail;
};

/**
 * Get the username field from credentialFields
 * @param {any} t - Translation function
 * @returns {FormBuilderFormField} Username form field
 */
const getUsernameField = (t: any): FormBuilderFormField => {
  const originalUsername = getOriginalUsernameField(t);

  // Modify the field for complete signup form
  return createModifiedField(originalUsername, t);
};

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
