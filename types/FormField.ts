import FieldRule from './FieldRule';

export enum FormFieldType {
  Text = 'text',
  Password = 'password',
  Phone = 'phone',
  Number = 'number',
}

type FormField = {
  field: string;
  rules?: FieldRule[];
  type: FormFieldType;
  defaultValue?: unknown;
};

export default FormField;
