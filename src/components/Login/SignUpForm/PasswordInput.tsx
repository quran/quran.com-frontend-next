import { FC, useState } from 'react';

import classNames from 'classnames';

import styles from './PasswordInput.module.scss';

import HideIcon from '@/icons/hide.svg';
import ShowIcon from '@/icons/show.svg';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  dataTestId?: string;
}

const PasswordInput: FC<Props> = ({ value = '', onChange, placeholder, dataTestId }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div
      className={classNames(styles.passwordInputContainer, {
        [styles.hasValue]: value,
      })}
    >
      <input
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        data-testid={dataTestId}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className={styles.toggleButton}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
      >
        {showPassword ? <HideIcon /> : <ShowIcon />}
      </button>
    </div>
  );
};

export default PasswordInput;
