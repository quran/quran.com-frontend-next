import { FC } from 'react';

import styles from './TextInputField.module.scss';

export enum InputType {
  TEXT = 'text',
  EMAIL = 'email',
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: InputType;
  className?: string;
  name?: string;
  autoComplete?: string;
}

const TextInputField: FC<Props> = ({
  value = '',
  onChange,
  placeholder,
  type = InputType.TEXT,
  className = '',
  name,
  autoComplete,
}) => (
  <div className={`${styles.textInputWrapper} ${className}`}>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      name={name}
      autoComplete={autoComplete}
      className={value ? styles.hasValue : ''}
    />
  </div>
);

export default TextInputField;
