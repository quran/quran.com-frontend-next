import React from 'react';

import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import classNames from 'classnames';

import styles from './Root.module.scss';

import useDirection from '@/hooks/useDirection';
import { Direction } from '@/utils/locale';

export enum RadioRootOrientation {
  Horizontal = 'horizontal',
  Vertical = 'vertical',
}

export interface Props {
  label?: React.ReactNode;
  defaultValue?: string;
  onChange?: (value: string) => void;
  value?: string;
  name?: string;
  isRequired?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const Root: React.FC<Props> = ({
  className,
  onChange,
  defaultValue,
  value,
  name,
  isRequired,
  children,
}) => {
  const direction = useDirection();

  return (
    <RadioGroupPrimitive.Root
      className={classNames(styles.container, className)}
      dir={direction as Direction}
      {...(onChange && { onValueChange: onChange })}
      {...(defaultValue && { defaultValue })}
      {...(value && { value })}
      {...(name && { name })}
      {...(isRequired && { required: isRequired })}
    >
      {children}
    </RadioGroupPrimitive.Root>
  );
};

export default Root;
