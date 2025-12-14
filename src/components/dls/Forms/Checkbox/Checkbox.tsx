import React from 'react';

import * as RadixCheckbox from '@radix-ui/react-checkbox';
import classNames from 'classnames';

import styles from './Checkbox.module.scss';

import DividerHorizontalIcon from '@/icons/divider-horizontal.svg';
import TickIcon from '@/icons/tick.svg';

const INDETERMINATE = 'indeterminate';

interface Props {
  containerClassName?: string;
  checkboxClassName?: string;
  indicatorClassName?: string;
  id: string;
  onChange: (checked: boolean) => void;
  checked?: boolean | typeof INDETERMINATE;
  disabled?: boolean;
  required?: boolean;
  label?: string | JSX.Element;
  name?: string;
  defaultChecked?: boolean;
}

const Checkbox: React.FC<Props> = ({
  containerClassName,
  checkboxClassName,
  indicatorClassName,
  disabled = false,
  required = false,
  defaultChecked,
  checked,
  id,
  label,
  name,
  onChange,
}) => {
  return (
    <div
      className={classNames(styles.container, containerClassName, { [styles.disabled]: disabled })}
    >
      <RadixCheckbox.Root
        disabled={disabled}
        name={name}
        required={required}
        onCheckedChange={onChange}
        id={id}
        className={classNames(styles.checkbox, checkboxClassName)}
        defaultChecked={defaultChecked}
        {...(checked !== undefined && { checked })} // make it controlled only when checked is passed.
      >
        <span
          className={classNames(styles.indicator, indicatorClassName, {
            [styles.disabledIndicator]: disabled,
          })}
        >
          <RadixCheckbox.Indicator>
            {checked === INDETERMINATE ? <DividerHorizontalIcon /> : <TickIcon />}
          </RadixCheckbox.Indicator>
        </span>
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
