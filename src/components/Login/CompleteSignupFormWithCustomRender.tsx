import React from 'react';

import TextInputField, { InputType } from './common/TextInputField';

import { FormBuilderFormField } from '@/components/FormBuilder/FormBuilderTypes';
import styles from '@/components/Login/login.module.scss';
import UserProfile from 'types/auth/UserProfile';

/**
 * Adds customRender to form fields for CompleteSignupForm
 * @param {FormBuilderFormField[]} formFields - The original form fields
 * @param {UserProfile | undefined} userData - User data for pre-filling fields
 * @param {Record<string, string>} formData - Form data that overrides userData
 * @returns {FormBuilderFormField[]} Form fields with customRender added
 */
const addCustomRenderToCompleteSignupFormFields = (
  formFields: FormBuilderFormField[],
  userData?: UserProfile,
  formData: Record<string, string> = {},
): FormBuilderFormField[] => {
  return formFields.map((field) => {
    // Get field value from form data first, then user data if available
    const fieldValue = formData[field.field] || userData?.[field.field] || '';

    // Set default value from user data
    const updatedField = {
      ...field,
      defaultValue: fieldValue,
    };

    // Add customRender for text fields
    if (field.type === 'text') {
      const isEmail = field.field === 'email';
      // Only disable email if it's from userData and not from formData
      const isDisabled = isEmail && !!userData?.[field.field] && !formData[field.field];

      return {
        ...updatedField,
        customRender: (props: {
          value: string;
          onChange: (value: string) => void;
          placeholder?: string;
        }) => {
          return (
            <TextInputField
              value={props.value}
              onChange={props.onChange}
              placeholder={props.placeholder}
              type={isEmail ? InputType.EMAIL : InputType.TEXT}
              disabled={isDisabled}
            />
          );
        },
        errorClassName: styles.errorText,
        containerClassName: styles.inputContainer,
      };
    }

    return updatedField;
  });
};

export default addCustomRenderToCompleteSignupFormFields;
