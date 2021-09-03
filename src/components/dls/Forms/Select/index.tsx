import React, { ChangeEvent, useCallback } from 'react';
import classNames from 'classnames';
import styles from './Select.module.scss';
import CaretIcon from '../../../../../public/icons/caret-down.svg';

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export enum SelectSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
}

interface Props {
  id: string;
  name: string;
  options: SelectOption[];
  disabled?: boolean;
  required?: boolean;
  size?: SelectSize;
  value?: string;
  placeholder?: string;
  onChange?: (value: string | number) => void;
}

const Select: React.FC<Props> = ({
  name,
  id,
  onChange,
  options,
  value,
  disabled = false,
  required = false,
  size = SelectSize.Medium,
  placeholder = 'Select an option',
}) => {
  const onSelectChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      if (onChange) {
        onChange(e.target.value);
      }
    },
    [onChange],
  );

  return (
    <div
      className={classNames(styles.container, {
        [styles.disabledContainer]: disabled,
        [styles.smallContainer]: size === SelectSize.Small,
        [styles.mediumContainer]: size === SelectSize.Medium,
        [styles.largeContainer]: size === SelectSize.Large,
      })}
    >
      <select
        className={classNames(styles.select, {
          [styles.disabledSelect]: disabled,
        })}
        name={name}
        id={id}
        onChange={onSelectChange}
        disabled={disabled}
        required={required}
        {...(value ? { value } : { defaultValue: '' })}
      >
        <option value="" disabled hidden>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled || false}>
            {option.label}
          </option>
        ))}
      </select>
      <div className={classNames(styles.arrow, { [styles.disabledArrow]: disabled })}>
        <CaretIcon />
      </div>
    </div>
  );
};

export default Select;
