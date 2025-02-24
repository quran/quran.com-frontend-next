import { getEmailField, getUsernameField } from './credentialFields';
import { getNameFields } from './nameFields';

import { FormBuilderFormField } from '@/components/FormBuilder/FormBuilderTypes';
import getPasswordFields from '@/components/Login/SignUpForm/PasswordFields';

const getSignUpFormFields = (t: any): FormBuilderFormField[] => [
  ...getNameFields(t),
  getEmailField(t),
  getUsernameField(t),
  ...getPasswordFields(t),
];

export default getSignUpFormFields;
