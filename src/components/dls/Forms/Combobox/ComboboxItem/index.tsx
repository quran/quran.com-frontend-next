import React, { RefObject, ChangeEvent, memo, ReactNode } from 'react';

import classNames from 'classnames';

import styles from './ComboboxItem.module.scss';

export interface DropdownItem {
  id: string;
  value: string;
  name: string;
  label: string;
  isChecked?: boolean;
  isDisabled?: boolean;
  prefix?: ReactNode;
  suffix?: string;
}

interface Props {
  isChecked: boolean;
  isDisabled: boolean;
  itemId?: string;
  selectedItemRef?: RefObject<HTMLDivElement>;
  item?: DropdownItem;
  onItemSelectedChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  isNotFound?: boolean;
  emptyMessage?: string;
}

const ComboboxItem: React.FC<Props> = ({
  isChecked,
  isDisabled,
  itemId,
  selectedItemRef,
  item,
  onItemSelectedChange,
  isNotFound = false,
  emptyMessage,
}) => {
  if (isNotFound) {
    return (
      <div className={classNames(styles.itemContainer, styles.disabledItem)}>{emptyMessage}</div>
    );
  }
  return (
    <label htmlFor={itemId} key={itemId}>
      <div
        ref={isChecked ? selectedItemRef : null}
        className={classNames(
          styles.itemContainer,
          { [styles.disabledItem]: isDisabled },
          { [styles.enabledItem]: !isDisabled },
          { [styles.checkedItem]: isChecked },
        )}
      >
        <input
          type="checkbox"
          className={styles.input}
          id={itemId}
          name={item.name}
          disabled={isDisabled}
          checked={isChecked}
          onChange={onItemSelectedChange}
          data-item-label={item.label}
        />
        <label
          htmlFor={itemId}
          className={classNames(styles.labelContainer, { [styles.itemLabel]: !isDisabled })}
        >
          <div className={styles.prefixContainer}>
            {item.prefix && <div className={styles.prefix}>{item.prefix}</div>} {item.label}
          </div>
          {item.suffix && <div className={styles.suffixContainer}>{item.suffix}</div>}
        </label>
      </div>
    </label>
  );
};

export default memo(ComboboxItem);
