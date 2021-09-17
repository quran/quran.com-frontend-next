import React from 'react';

import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import classNames from 'classnames';

import styles from './RadioGroup.module.scss';

export interface RadioItem {
  value: string;
  id: string;
  label: string;
  disabled?: boolean;
  required?: boolean;
}

export enum RadioGroupOrientation {
  Horizontal = 'horizontal',
  Vertical = 'vertical',
}

interface Props {
  items: RadioItem[];
  label: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  value?: string;
  name?: string;
  required?: boolean;
  loop?: boolean;
  orientation?: RadioGroupOrientation;
}

const RadioGroup: React.FC<Props> = ({
  items,
  label,
  onChange,
  defaultValue,
  value,
  name,
  required,
  disabled = false,
  orientation = RadioGroupOrientation.Vertical,
}) => (
  <RadioGroupPrimitive.Root
    className={styles.container}
    aria-label={label}
    orientation={orientation}
    {...(onChange && { onValueChange: onChange })}
    {...(defaultValue && { defaultValue })}
    {...(value && { value })}
    {...(name && { name })}
    {...(required && { required })}
  >
    {items.map((item) => {
      const isDisabled = disabled === true || item.disabled === true;
      return (
        <div className={styles.radioItemContainer} key={item.id}>
          <RadioGroupPrimitive.Item
            value={item.value}
            id={item.id}
            className={styles.radioItem}
            disabled={isDisabled}
            required={item.required || false}
          >
            <RadioGroupPrimitive.Indicator className={styles.indicator} />
          </RadioGroupPrimitive.Item>
          <label
            htmlFor={item.id}
            className={classNames(styles.label, { [styles.disabled]: isDisabled })}
          >
            {item.label}
          </label>
        </div>
      );
    })}
  </RadioGroupPrimitive.Root>
);

export default RadioGroup;
