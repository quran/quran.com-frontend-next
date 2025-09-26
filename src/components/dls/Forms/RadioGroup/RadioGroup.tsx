import React from 'react';

import classNames from 'classnames';

import Item from './Item';
import styles from './RadioGroup.module.scss';
import Root, { Props as RootProps } from './Root';

export interface RadioItem {
  value: string;
  id: string;
  label: string;
  isDisabled?: boolean;
  isRequired?: boolean;
}

interface Props extends RootProps {
  items: RadioItem[];
  isDisabled?: boolean;
}

const RadioGroup = ({ items, isDisabled = false, ...props }: Props) => {
  return (
    <Root {...props}>
      {items.map((item) => {
        const isItemDisabled = isDisabled === true || item.isDisabled === true;
        return (
          <div className={styles.radioItemContainer} key={item.id}>
            <Item
              value={item.value}
              id={item.id}
              disabled={isItemDisabled}
              required={item.isRequired || false}
            />

            <label
              htmlFor={item.id}
              className={classNames(styles.label, { [styles.disabled]: isItemDisabled })}
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
