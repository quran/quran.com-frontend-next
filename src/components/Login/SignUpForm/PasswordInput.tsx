import { FC, useState } from 'react';

import classNames from 'classnames';

import styles from './PasswordInput.module.scss';

import HideIcon from '@/icons/hide.svg';
import ShowIcon from '@/icons/show.svg';

interface Props {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  containerClassName?: string;
  isDisabled?: boolean;
  dataTestId?: string;
}

const PasswordInput: FC<Props> = ({
  label,
  value = '',
  onChange,
  placeholder,
  containerClassName,
  isDisabled = false,
  dataTestId,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      {label && <p className={styles.label}>{label}</p>}
      <div
        className={classNames(styles.passwordInputContainer, containerClassName, {
          [styles.hasValue]: value,
          [styles.disabled]: isDisabled,
        })}
      >
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={isDisabled}
          data-testid={dataTestId}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className={styles.toggleButton}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          disabled={isDisabled}
        >
          {showPassword ? <HideIcon /> : <ShowIcon />}
        </button>
      </div>
    </>
  );
};

export default PasswordInput;
