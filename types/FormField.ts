import FieldRule from './FieldRule';

export enum FormFieldType {
  Text = 'text',
  Password = 'password',
  Phone = 'phone',
  Number = 'number',
  TextArea = 'textarea',
}

type FormField = {
  field: string;
  placeholder?: string;
  label?: string;
  rules?: FieldRule[];
  type: FormFieldType;
  defaultValue?: unknown;
};

export default FormField;
