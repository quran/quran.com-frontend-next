import { FC } from 'react';

import PasswordInput from './PasswordInput';
import PasswordValidation from './PasswordValidation';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  containerClassName?: string;
  isDisabled?: boolean;
}

const PasswordField: FC<Props> = ({
  value = '',
  onChange,
  placeholder,
  containerClassName,
  isDisabled = false,
}) => (
  <>
    <PasswordInput
      containerClassName={containerClassName}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      isDisabled={isDisabled}
    />
    <PasswordValidation value={value} />
  </>
);

export default PasswordField;
