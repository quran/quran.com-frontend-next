import { FC } from 'react';

import PasswordInput from '../SignUpForm/PasswordInput';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  dataTestId?: string;
}

const SignInPasswordField: FC<Props> = ({ value = '', onChange, placeholder, dataTestId }) => (
  <PasswordInput
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    dataTestId={dataTestId}
  />
);

export default SignInPasswordField;
