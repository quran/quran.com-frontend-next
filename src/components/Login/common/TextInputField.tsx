import { FC } from 'react';

import classNames from 'classnames';

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
  disabled?: boolean;
}

const TextInputField: FC<Props> = ({
  value = '',
  onChange,
  placeholder,
  type = InputType.TEXT,
  className = '',
  name,
  autoComplete,
  disabled,
}) => (
  <div
    className={classNames(styles.textInputWrapper, className, {
      [styles.disabled]: disabled,
    })}
  >
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      name={name}
      autoComplete={autoComplete}
      disabled={disabled}
      className={value ? styles.hasValue : ''}
    />
  </div>
);

export default TextInputField;
