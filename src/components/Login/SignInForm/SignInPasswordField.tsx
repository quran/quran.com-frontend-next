import { FC } from 'react';

import PasswordInput from '../SignUpForm/PasswordInput';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SignInPasswordField: FC<Props> = ({ value = '', onChange, placeholder }) => (
  <PasswordInput value={value} onChange={onChange} placeholder={placeholder} />
);

export default SignInPasswordField;
