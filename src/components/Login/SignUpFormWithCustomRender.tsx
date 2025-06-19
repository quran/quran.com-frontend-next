import { FormBuilderFormField } from '../FormBuilder/FormBuilderTypes';

import AuthInput from './AuthInput';

import styles from '@/components/Login/login.module.scss';
import { FormFieldType } from '@/types/FormField';

/**
 * Adds customRender to form fields for SignUpForm
 * @param {FormBuilderFormField[]} formFields - The original form fields
 * @returns {FormBuilderFormField[]} Form fields with customRender added to text fields
 */
const addCustomRenderToFormFields = (
  formFields: FormBuilderFormField[],
): FormBuilderFormField[] => {
  return formFields.map((field) => {
    // Add customRender for text fields
    if (field.type === FormFieldType.Text) {
      return {
        ...field,
        customRender: (props) => (
          <AuthInput
            {...props}
            id={field.field}
            htmlType={field.field === 'email' ? 'email' : 'text'}
          />
        ),
        errorClassName: styles.errorText,
        containerClassName: styles.inputContainer,
      };
    }
    return field;
  });
};

export default addCustomRenderToFormFields;
