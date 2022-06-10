export enum FormFieldType {
  Text = 'text',
  Password = 'password',
  Phone = 'phone',
  Number = 'number',
}

export enum ErrorMessageId {
  InvalidEmail = 'invalid-email',
}

type FormField = {
  field: string;
  pattern?: {
    value: string; // regex in
    messageId: ErrorMessageId;
  };
  isRequired?: boolean;
  type: FormFieldType;
};

export default FormField;
