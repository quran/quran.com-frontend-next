import { FC } from 'react';

import PasswordInput from './PasswordInput';
import PasswordValidation from './PasswordValidation';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  dataTestId?: string;
}

const PasswordField: FC<Props> = ({ value = '', onChange, placeholder, dataTestId }) => (
  <>
    <PasswordInput
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      dataTestId={dataTestId}
    />
    <PasswordValidation value={value} />
  </>
);

export default PasswordField;
