import React from 'react';

import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import classNames from 'classnames';

import styles from './RadioGroup.module.scss';

import useDirection from 'src/hooks/useDirection';
import { Direction } from 'src/utils/locale';

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
  renderItem?: (item: RadioItem) => React.ReactNode;
}

const RadioGroup: React.FC<Props> & {
  Item: (props: RadioGroupPrimitive.RadioGroupItemProps) => React.ReactElement;
  Indicator: (props: RadioGroupPrimitive.RadioIndicatorProps) => React.ReactElement;
} = ({
  items,
  label,
  onChange,
  defaultValue,
  value,
  name,
  required,
  disabled = false,
  orientation = RadioGroupOrientation.Vertical,
  renderItem,
}) => {
  const direction = useDirection();

  return (
    <RadioGroupPrimitive.Root
      className={styles.container}
      dir={direction as Direction}
      aria-label={label}
      orientation={orientation}
      {...(onChange && { onValueChange: onChange })}
      {...(defaultValue && { defaultValue })}
      {...(value && { value })}
      {...(name && { name })}
      {...(required && { required })}
    >
      {items.map((item) => {
        if (renderItem) return renderItem(item);

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
};

// eslint-disable-next-line react/no-multi-comp
RadioGroup.Item = ({ className, ...props }) => (
  <RadioGroupPrimitive.Item className={classNames(styles.radioItem, className)} {...props} />
);

// eslint-disable-next-line react/no-multi-comp
RadioGroup.Indicator = ({ className, ...props }) => (
  <RadioGroupPrimitive.Indicator className={classNames(styles.indicator, className)} {...props} />
);

export default RadioGroup;
