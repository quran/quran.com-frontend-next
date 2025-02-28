import { FC } from 'react';

import PasswordInput from './PasswordInput';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const ConfirmPasswordField: FC<Props> = ({ value, onChange, placeholder }) => (
  <PasswordInput value={value} onChange={onChange} placeholder={placeholder} />
);

export default ConfirmPasswordField;
