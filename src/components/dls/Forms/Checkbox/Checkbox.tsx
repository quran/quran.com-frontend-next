import React from 'react';

import * as RadixCheckbox from '@radix-ui/react-checkbox';
import classNames from 'classnames';

import DividerHorizontalIcon from '../../../../../public/icons/divider-horizontal.svg';
import TickIcon from '../../../../../public/icons/tick.svg';

import styles from './Checkbox.module.scss';

const INDETERMINATE = 'indeterminate';

interface Props {
  id: string;
  onChange: (checked: boolean) => void;
  checked?: boolean | typeof INDETERMINATE;
  disabled?: boolean;
  required?: boolean;
  label?: string;
  name?: string;
}

const Checkbox: React.FC<Props> = ({
  disabled = false,
  required = false,
  checked,
  id,
  label,
  name,
  onChange,
}) => {
  /**
   * Handle when the value of the checkbox input changes.
   *
   * @param {boolean} newChecked
   * @returns {void}
   */
  const handleChange = (newChecked: boolean): void => {
    onChange(newChecked);
  };

  return (
    <div className={classNames(styles.container, { [styles.disabled]: disabled })}>
      <RadixCheckbox.Root
        disabled={disabled}
        name={name}
        required={required}
        onCheckedChange={handleChange}
        id={id}
        className={styles.checkbox}
        {...(checked !== undefined && { checked })} // make it controlled only when checked is passed.
      >
        <RadixCheckbox.Indicator
          className={classNames(styles.indicator, { [styles.disabledIndicator]: disabled })}
        >
          {checked === INDETERMINATE ? <DividerHorizontalIcon /> : <TickIcon />}
        </RadixCheckbox.Indicator>
      </RadixCheckbox.Root>
      {label && (
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
      )}
    </div>
  );
};

export default Checkbox;
