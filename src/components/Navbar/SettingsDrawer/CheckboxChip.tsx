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

const CheckboxChip = ({
  checked,
  label,
  id,
  name,
  onChange,
  disabled,
}: CheckboxChipProps): JSX.Element => {
  return (
    <label
      htmlFor={id}
      className={classNames(styles.chip, {
        [styles.chipSelected]: checked,
        [styles.chipDisabled]: disabled,
      })}
      aria-disabled={disabled}
    >
      <input
        type="checkbox"
        id={id}
        name={name}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className={styles.hiddenCheckbox}
      />
      {checked && (
        <span className={styles.checkIcon} aria-hidden="true">
          <CheckIcon />
        </span>
      )}
      <span className={styles.label}>{label}</span>
    </label>
  );
};

export default CheckboxChip;
