import React, { RefObject, ChangeEvent, memo } from 'react';
import classNames from 'classnames';
import styles from './SearchDropdownItem.module.scss';

export interface DropdownItem {
  id: string;
  value: string;
  name: string;
  label: string;
  checked?: boolean;
  disabled?: boolean;
}

interface Props {
  checked: boolean;
  disabled: boolean;
  itemId?: string;
  selectedItemRef?: RefObject<HTMLDivElement>;
  item?: DropdownItem;
  onItemSelected?: (event: ChangeEvent<HTMLInputElement>) => void;
  isNotFound?: boolean;
  noResultText?: string;
}

const SearchDropdownItem: React.FC<Props> = ({
  checked,
  disabled,
  itemId,
  selectedItemRef,
  item,
  onItemSelected,
  isNotFound = false,
  noResultText,
}) => {
  if (isNotFound) {
    return (
      <div className={classNames(styles.itemContainer, styles.disabledItem)}>{noResultText}</div>
    );
  }
  return (
    <label htmlFor={itemId} key={itemId}>
      <div
        ref={checked ? selectedItemRef : null}
        className={classNames(
          styles.itemContainer,
          { [styles.checkedItemContainer]: checked },
          { [styles.disabledItem]: disabled },
          { [styles.enabledItem]: !disabled },
        )}
      >
        <input
          type="radio"
          className={styles.input}
          id={itemId}
          name={item.name}
          disabled={disabled}
          checked={checked}
          onChange={onItemSelected}
        />
        <label htmlFor={itemId} className={classNames({ [styles.itemLabel]: !disabled })}>
          {item.label}
        </label>
      </div>
    </label>
  );
};

export default memo(SearchDropdownItem);
