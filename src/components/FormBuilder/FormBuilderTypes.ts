import FieldRule from 'types/FieldRule';
import FormField from 'types/FormField';

export type FormBuilderFieldRule = Pick<FieldRule, 'type' | 'value'> & { errorMessage: string };
export type FormBuilderFormField = Pick<FormField, 'field' | 'type'> & {
  defaultValue?: any;
  label?: string;
  rules?: FormBuilderFieldRule[];
};
