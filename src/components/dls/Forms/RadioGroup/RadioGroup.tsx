import React from 'react';

import classNames from 'classnames';

import Item from './Item';
import styles from './RadioGroup.module.scss';
import Root, { Props as RootProps } from './Root';

export interface RadioItem {
  value: string;
  id: string;
  label: string;
  disabled?: boolean;
  required?: boolean;
}

interface Props extends RootProps {
  items: RadioItem[];
  disabled?: boolean;
}

const RadioGroup = ({ items, disabled = false, ...props }: Props) => {
  return (
    <Root {...props}>
      {items.map((item) => {
        const isDisabled = disabled === true || item.disabled === true;
        return (
          <div className={styles.radioItemContainer} key={item.id}>
            <Item
              value={item.value}
              id={item.id}
              disabled={isDisabled}
              required={item.required || false}
            />

            <label
              htmlFor={item.id}
              className={classNames(styles.label, { [styles.disabled]: isDisabled })}
            >
              {item.label}
            </label>
          </div>
        );
      })}
    </Root>
  );
};

RadioGroup.Root = Root;
RadioGroup.Item = Item;

// export `RadioGroupOrientation` type from here so that files that are using it don't break
export { RadioRootOrientation as RadioGroupOrientation } from './Root';

export default RadioGroup;
