import React from 'react';

import classNames from 'classnames';

import styles from './AuthInput.module.scss';

import Input, { InputSize } from '@/components/dls/Forms/Input';

interface AuthInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  htmlType?: 'text' | 'email' | 'password';
  name?: string;
  autoComplete?: string;
  className?: string;
}

/**
 * Specialized input component for authentication forms.
 * Provides consistent styling and behavior across all auth forms.
 * @param {AuthInputProps} props - The component props
 * @returns {React.FC<AuthInputProps>} - The AuthInput component
 */
const AuthInput: React.FC<AuthInputProps> = ({
  id,
  value,
  onChange,
  placeholder,
  disabled = false,
  htmlType = 'text',
  name,
  autoComplete,
  className,
}) => {
  return (
    <Input
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      htmlType={htmlType}
      name={name}
      size={InputSize.Large}
      fixedWidth={false}
      shouldFlipOnRTL
      containerClassName={classNames(styles.authContainer, className, {
        [styles.disabled]: disabled,
      })}
      inputClassName={classNames(styles.authInput, {
        [styles.hasValue]: value,
      })}
      {...(autoComplete && { autoComplete })}
    />
  );
};

export default AuthInput;
