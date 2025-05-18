import { ReactNode } from 'react';

import FieldRule from 'types/FieldRule';
import FormField from 'types/FormField';

export type FormBuilderFieldRule = Pick<FieldRule, 'type' | 'value'> & { errorMessage: string };
export type FormBuilderFormField = Pick<FormField, 'field' | 'type'> & {
  defaultValue?: any;
  label?: string | ReactNode;
  placeholder?: string;
  rules?: FormBuilderFieldRule[];
  containerClassName?: string;
  checked?: boolean;
  fieldSetLegend?: string;
  onChange?: (value: unknown) => void;
  extraSection?: ReactNode | ((value: string) => ReactNode);
  customRender?: (props: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  }) => ReactNode;
};
