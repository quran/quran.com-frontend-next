export enum FormFieldType {
  Text = 'text',
  Password = 'password',
  Phone = 'phone',
  Number = 'number',
}

export enum ErrorMessageId {
  InvalidEmail = 'invalid-email',
  RequiredField = 'required-field',
}
export enum RuleType {
  Required = 'required',
  Regex = 'regex',
}

type RuleValue = string | boolean;
export type FieldRule = {
  type: RuleType;
  value: RuleValue;
  errorId?: ErrorMessageId;
};

type FormField = {
  field: string;
  rules?: FieldRule[];
  type: FormFieldType;
};

export default FormField;
