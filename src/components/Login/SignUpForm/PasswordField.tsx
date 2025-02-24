import { FC } from 'react';

import PasswordInput from './PasswordInput';
import PasswordValidation from './PasswordValidation';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const PasswordField: FC<Props> = ({ value = '', onChange, placeholder }) => (
  <>
    <PasswordInput value={value} onChange={onChange} placeholder={placeholder} />
    <PasswordValidation value={value} />
  </>
);

export default PasswordField;
