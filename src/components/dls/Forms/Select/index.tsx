import React, { ChangeEvent, useCallback } from 'react';

import classNames from 'classnames';

import styles from './Select.module.scss';

import CaretIcon from '@/icons/caret-down.svg';

export interface SelectOption {
  label: string;
  value: string | number;
  isDisabled?: boolean;
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
  isDisabled?: boolean;
  isRequired?: boolean;
  size?: SelectSize;
  value?: string;
  placeholder?: string;
  onChange?: (value: string | number) => void;
  hasDefaultStyle?: boolean;
  className?: string;
  isWithBackground?: boolean;
}

const Select: React.FC<Props> = ({
  name,
  id,
  onChange,
  options,
  value,
  isDisabled = false,
  isRequired = false,
  size = SelectSize.Medium,
  placeholder = 'Select an option',
  hasDefaultStyle = true,
  className,
  isWithBackground = true,
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
        [styles.defaultStyledContainer]: hasDefaultStyle,
        [className]: className,
        [styles.disabledContainer]: isDisabled,
        [styles.smallContainer]: size === SelectSize.Small,
        [styles.mediumContainer]: size === SelectSize.Medium,
        [styles.largeContainer]: size === SelectSize.Large,
        [styles.withBackground]: isWithBackground,
      })}
    >
      <select
        className={classNames(styles.select, {
          [styles.defaultStyledSelect]: hasDefaultStyle,
          [styles.disabledSelect]: isDisabled,
        })}
        name={name}
        id={id}
        onChange={onSelectChange}
        disabled={isDisabled}
        required={isRequired}
        {...(value ? { value } : { defaultValue: '' })}
      >
        <option value="" disabled hidden>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.isDisabled || false}>
            {option.label}
          </option>
        ))}
      </select>
      <div className={classNames(styles.arrow, { [styles.disabledArrow]: isDisabled })}>
        <CaretIcon />
      </div>
    </div>
  );
};

export default Select;
