import classNames from 'classnames';

import styles from './CheckboxChip.module.scss';

import CheckIcon from '@/icons/check.svg';

interface CheckboxChipProps {
  checked: boolean;
  label: string;
  id: string;
  name: string;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

const CheckboxChip = ({ checked, label, id, name, onChange, disabled }: CheckboxChipProps) => {
  return (
    <button
      type="button"
      id={id}
      name={name}
      role="checkbox"
      aria-checked={checked}
      aria-disabled={disabled}
      disabled={disabled}
      className={classNames(styles.chip, {
        [styles.chipSelected]: checked,
        [styles.chipDisabled]: disabled,
      })}
      onClick={() => onChange(!checked)}
    >
      {checked && (
        <span className={styles.checkIcon}>
          <CheckIcon />
        </span>
      )}
      <span className={styles.label}>{label}</span>
    </button>
  );
};

export default CheckboxChip;
