import { FC } from 'react';

import PasswordInput from './PasswordInput';
import PasswordValidation from './PasswordValidation';

interface Props {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  containerClassName?: string;
  isDisabled?: boolean;
  dataTestId?: string;
}

const PasswordField: FC<Props> = ({
  label,
  value = '',
  onChange,
  placeholder,
  containerClassName,
  isDisabled = false,
  dataTestId,
}) => (
  <>
    <PasswordInput
      dataTestId={dataTestId}
      label={label}
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
