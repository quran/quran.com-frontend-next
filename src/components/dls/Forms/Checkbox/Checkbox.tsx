import React from 'react';

import * as RadixCheckbox from '@radix-ui/react-checkbox';
import classNames from 'classnames';

import styles from './Checkbox.module.scss';

import DividerHorizontalIcon from '@/icons/divider-horizontal.svg';
import TickIcon from '@/icons/tick.svg';

const INDETERMINATE = 'indeterminate';

interface Props {
  id: string;
  onChange: (isChecked: boolean) => void;
  isChecked?: boolean | typeof INDETERMINATE;
  isDisabled?: boolean;
  isRequired?: boolean;
  label?: React.ReactNode;
  name?: string;
  isDefaultChecked?: boolean;
}

const Checkbox: React.FC<Props> = ({
  isDisabled = false,
  isRequired = false,
  isDefaultChecked,
  isChecked,
  id,
  label,
  name,
  onChange,
}) => {
  /**
   * Handle when the value of the checkbox input changes.
   *
   * @param {boolean} isNewChecked
   * @returns {void}
   */
  const handleChange = (isNewChecked: boolean): void => {
    onChange(isNewChecked);
  };

  return (
    <div className={classNames(styles.container, { [styles.disabled]: isDisabled })}>
      <RadixCheckbox.Root
        disabled={isDisabled}
        name={name}
        required={isRequired}
        onCheckedChange={handleChange}
        id={id}
        className={styles.checkbox}
        defaultChecked={isDefaultChecked}
        {...(isChecked !== undefined && { checked: isChecked })} // make it controlled only when isChecked is passed.
      >
        <RadixCheckbox.Indicator
          className={classNames(styles.indicator, { [styles.disabledIndicator]: isDisabled })}
        >
          {isChecked === INDETERMINATE ? <DividerHorizontalIcon /> : <TickIcon />}
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
