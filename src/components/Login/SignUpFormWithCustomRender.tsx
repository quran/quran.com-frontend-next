import TextInputField, { InputType } from './common/TextInputField';

import { FormBuilderFormField } from '@/components/FormBuilder/FormBuilderTypes';
import styles from '@/components/Login/login.module.scss';

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
    if (field.type === 'text') {
      return {
        ...field,
        customRender: (props) => (
          <TextInputField
            {...props}
            type={field.field === InputType.EMAIL ? InputType.EMAIL : InputType.TEXT}
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
