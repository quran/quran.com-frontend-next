import FieldRule from './FieldRule';

export enum FormFieldType {
  Text = 'text',
  Password = 'password',
  Phone = 'phone',
  Number = 'number',
  TextArea = 'textarea',
  Checkbox = 'checkbox',
  StarRating = 'starRating',
}

type FormField = {
  field: string;
  placeholder?: string;
  label?: string | JSX.Element;
  rules?: FieldRule[];
  type: FormFieldType;
  defaultValue?: unknown;
};

export default FormField;
