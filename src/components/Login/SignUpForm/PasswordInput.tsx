import { FC, useState } from 'react';

import styles from './PasswordInput.module.scss';

import HideIcon from '@/icons/hide.svg';
import ShowIcon from '@/icons/show.svg';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const PasswordInput: FC<Props> = ({ value = '', onChange, placeholder }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={styles.passwordInputContainer}>
      <input
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
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
