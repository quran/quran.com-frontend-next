/* eslint-disable jsx-a11y/role-has-required-aria-props */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, {
  ChangeEvent,
  useState,
  ReactNode,
  useEffect,
  RefObject,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import classNames from 'classnames';
import useOutsideClickDetector from 'src/hooks/useOutsideClickDetector';
import useKeyPressedDetector from 'src/hooks/useKeyPressedDetector';
import useFocus from '../../../../hooks/useFocusElement';
import { DropdownItem } from './ComboboxItem';
import styles from './Combobox.module.scss';
import Tag from './Tag';
import ComboboxSize from './types/ComboboxSize';
import ClearInputIcon from './Icons/ClearInputIcon';
import CaretInputIcon from './Icons/CaretInputIcon';
import SearchInputIcon from './Icons/SearchInputIcon';
import ComboboxItems from './ComboboxItems';
import { InitialValue, Value, MultiSelectValue, InitialSelectedItems } from './types/Values';

interface Props {
  id: string;
  items: DropdownItem[];
  onChange?: (selectedValues: InitialValue, dropDownId: string) => void;
  initialInputValue?: string;
  emptyMessage?: string;
  label?: string | ReactNode;
  placeholder?: string;
  size?: ComboboxSize;
  value?: InitialValue;
  clearable?: boolean;
  isMultiSelect?: boolean;
  tagsLimit?: number;
  disabled?: boolean;
  hasError?: boolean;
}

const Combobox: React.FC<Props> = ({
  items,
  placeholder = 'Search...',
  hasError = false,
  value,
  initialInputValue,
  disabled = false,
  clearable = true,
  isMultiSelect = false,
  emptyMessage = 'No results',
  tagsLimit,
  label,
  id,
  size = ComboboxSize.Medium,
  onChange,
}) => {
  const [isOpened, setIsOpened] = useState(false);
  const [inputValue, setInputValue] = useState<string>(initialInputValue || '');
  const [selectedValue, setSelectedValue] = useState<Value>(() => {
    if (!value) {
      return getDefaultValue(isMultiSelect);
    }
    if (!isMultiSelect) {
      return value as string;
    }
    return convertArrayToObject(value as InitialSelectedItems);
  });
  const [filteredItems, setFilteredItems] = useState<DropdownItem[]>(items);
  const [focusInput, inputRef]: [() => void, RefObject<HTMLInputElement>] = useFocus();
  const comboBoxRef = useRef(null);
  const closeCombobox = useCallback(() => {
    setIsOpened(false);
  }, []);
  useOutsideClickDetector(comboBoxRef, closeCombobox, true);
  const isEscapeKeyPressed = useKeyPressedDetector('Escape', true);
  // listen to any changes of escape key being pressed.
  useEffect(() => {
    // if we allow closing the modal by keyboard and also ESCAPE key has been pressed, we close the modal.
    if (isEscapeKeyPressed === true) {
      closeCombobox();
    }
  }, [closeCombobox, isEscapeKeyPressed]);

  // if there are any changes in the items, we should update the filteredItems.
  // this is necessary when the parent items are have initial empty value and
  // the actual values are fetched remotely and by the time they have a value,
  // filteredItems would have already been initialized with the initial items value
  // and the actual values wouldn't reflect.
  useEffect(() => {
    setFilteredItems(items);
  }, [items]);

  // if there are any changes in the value, we should update the selectedValue.
  useEffect(() => {
    if (!value) {
      setSelectedValue(getDefaultValue(isMultiSelect));
    } else {
      setSelectedValue(
        isMultiSelect ? convertArrayToObject(value as InitialSelectedItems) : (value as string),
      );
    }
  }, [value, isMultiSelect]);

  // if there are any changes in the initialInputValue, we should update the inputValue.
  useEffect(() => {
    setInputValue(initialInputValue);
  }, [initialInputValue]);

  const tags = useMemo(() => {
    if (!isMultiSelect) {
      return null;
    }
    // get the labels of the selected items by looking inside items array
    return items
      .filter((item) => Object.keys(selectedValue as MultiSelectValue).includes(item.name))
      .map((item) => item.label);
  }, [isMultiSelect, items, selectedValue]);

  // if it's multiSelect & the inputValue is empty and we have at least 1 tag, then clicking the backspace should remove the last tag.
  const shouldDeleteLastTag = useKeyPressedDetector(
    'Backspace',
    isMultiSelect && !inputValue && !!tags.length,
  );

  const invokeOnChangeCallback = useCallback(
    (newValue) => {
      if (onChange) {
        onChange(isMultiSelect ? Object.keys(newValue) : (newValue as string), id);
      }
    },
    [id, isMultiSelect, onChange],
  );

  // listener for when the backspace is clicked.
  useEffect(() => {
    if (shouldDeleteLastTag) {
      setSelectedValue((prevSelectedValue: MultiSelectValue) => {
        const newSelectedValues = { ...prevSelectedValue };
        const lastTag = Object.keys(newSelectedValues).pop();
        delete newSelectedValues[lastTag];
        invokeOnChangeCallback(newSelectedValues);
        return newSelectedValues;
      });
    }
  }, [id, invokeOnChangeCallback, shouldDeleteLastTag]);

  const onSelectorClicked = () => {
    setIsOpened((prevIsOpened) => !prevIsOpened);
    // we need to focus on the input field whenever the user clicks anywhere inside the component.
    if (isMultiSelect) {
      focusInput();
    }
  };

  /**
   * Handle when an item is selected.
   *
   * @param {ChangeEvent<HTMLInputElement>} event
   */
  const onItemSelectedChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const { itemLabel } = event.target.dataset;
      const selectedItemName = event.target.name;
      const isUnSelect = !event.currentTarget.checked;
      if (isMultiSelect) {
        setSelectedValue((prevSelectedValues: MultiSelectValue) => {
          const newSelectedValues = { ...prevSelectedValues };
          if (isUnSelect) {
            delete newSelectedValues[selectedItemName];
          } else {
            newSelectedValues[selectedItemName] = true;
          }
          invokeOnChangeCallback(newSelectedValues);
          return newSelectedValues;
        });
        setInputValue(''); // reset the input value even if it's selecting.
        setFilteredItems(items); // reset the filtered items.
      } else {
        setInputValue(isUnSelect ? '' : itemLabel);
        setSelectedValue(() => {
          const newSelectedValue = isUnSelect ? '' : selectedItemName;
          invokeOnChangeCallback(newSelectedValue);
          return newSelectedValue;
        });
      }
      setIsOpened(false); // close the items container
    },
    [invokeOnChangeCallback, isMultiSelect, items],
  );

  /**
   * Handle when the user searches for an item.
   *
   * @param {React.FormEvent<HTMLInputElement>} event
   * @returns {void}
   */
  const onInputValueChange = (event: React.FormEvent<HTMLInputElement>): void => {
    const newInputValue = event.currentTarget.value;
    // if the search query is empty it means it has been cleared so we set the original items back.
    setFilteredItems(
      newInputValue === ''
        ? items
        : items.filter((item) =>
            // we convert the search query and the item's label to lowercase first then check if the label contains a part/all of the search query.
            item.label.toLowerCase().includes(newInputValue.toLowerCase()),
          ),
    );
    setInputValue(newInputValue);
    setIsOpened(true);
  };

  /**
   * Handle when the clear button is clicked.
   * We will reset the input value, the selected value
   * and the filtered items.
   *
   * @param {React.MouseEvent<HTMLSpanElement>} event
   */
  const onClearButtonClicked = (event: React.MouseEvent<HTMLSpanElement>) => {
    event.stopPropagation();
    setInputValue('');
    setSelectedValue(() => {
      const defaultSelectedValue = getDefaultValue(isMultiSelect);
      invokeOnChangeCallback(defaultSelectedValue);
      return defaultSelectedValue;
    });
    setFilteredItems(items);
  };

  /**
   * Handle when removing a tag.
   *
   * @param {React.MouseEvent<HTMLSpanElement>} event
   * @param {string} tag
   */
  const onRemoveTagClicked = useCallback(
    (event: React.MouseEvent<HTMLSpanElement>, tag: string) => {
      event.stopPropagation();
      const toBeRemovedTag = items.find((item) => item.label === tag);
      setSelectedValue((prevSelectedValues: MultiSelectValue) => {
        const newSelectedValues = { ...prevSelectedValues };
        delete newSelectedValues[toBeRemovedTag.name];
        invokeOnChangeCallback(newSelectedValues);
        return newSelectedValues;
      });
    },
    [invokeOnChangeCallback, items],
  );

  const shouldShowCaret =
    (!isMultiSelect && !inputValue) || (isMultiSelect && !inputValue && !tags.length);
  const shouldShowClear = clearable && !shouldShowCaret;
  // if we should prevent selecting when the tags limit has been reached.
  const preventSelecting = tagsLimit && tags && tags.length >= tagsLimit;
  return (
    <>
      {label && <p className={styles.label}>{label}</p>}
      <div
        ref={comboBoxRef}
        className={classNames(styles.comboboxContainer, { [styles.enabled]: !disabled })}
      >
        <div
          onClick={onSelectorClicked}
          className={classNames(styles.select, {
            [styles.disabledSearch]: disabled,
          })}
        >
          <SearchInputIcon />
          <div
            className={classNames(styles.selector, {
              [styles.disabledSelector]: disabled,
              [styles.activeSelector]: !disabled && !hasError && isOpened,
              [styles.hasError]: hasError,
            })}
          >
            <div
              className={classNames({
                [styles.overflow]: isMultiSelect,
                [styles.fullWidth]: !isMultiSelect,
              })}
            >
              {isMultiSelect &&
                tags.map((tag) => (
                  <div key={tag} className={styles.overflowItem}>
                    <Tag tag={tag} onRemoveTagClicked={onRemoveTagClicked} size={size} />
                  </div>
                ))}
              <div className={styles.overflowItem}>
                <div
                  className={classNames(styles.search, { [styles.fullWidth]: !isMultiSelect })}
                  style={{
                    ...(isMultiSelect && inputValue && { width: `${inputValue.length}rem` }),
                  }}
                >
                  <input
                    ref={inputRef}
                    autoComplete="off"
                    type="search"
                    className={classNames(styles.multiSelectSearchInput, {
                      [styles.smallSearchInput]: size === ComboboxSize.Small,
                      [styles.mediumSearchInput]: size === ComboboxSize.Medium,
                      [styles.largeSearchInput]: size === ComboboxSize.Large,
                    })}
                    role="combobox"
                    aria-haspopup="listbox"
                    aria-expanded={isOpened}
                    aria-owns={id}
                    aria-autocomplete="list"
                    onChange={onInputValueChange}
                    value={inputValue}
                    disabled={disabled}
                    readOnly={false}
                    unselectable="on"
                    {...(!isMultiSelect && { placeholder })}
                  />
                </div>
              </div>
            </div>
            {isMultiSelect && !tags.length && !inputValue && (
              <span className={styles.placeholder}>{placeholder}</span>
            )}
          </div>
          <CaretInputIcon isOpened={isOpened} shouldShowIcon={shouldShowCaret} />
          <ClearInputIcon
            shouldShowIcon={shouldShowClear}
            onClearButtonClicked={onClearButtonClicked}
          />
        </div>
        <ComboboxItems
          onItemSelectedChange={onItemSelectedChange}
          isOpened={isOpened}
          disabled={disabled}
          size={size}
          filteredItems={filteredItems}
          isMultiSelect={isMultiSelect}
          preventSelecting={preventSelecting}
          selectedValue={selectedValue}
          id={id}
          emptyMessage={emptyMessage}
        />
      </div>
    </>
  );
};

/**
 * Get the default value based on the type:
 *
 * - if it's multi-select, it's an empty object.
 * - if it's single-select, it's an empty string.
 *
 * @param {boolean} isMultiSelect
 * @returns {Value}
 */
const getDefaultValue = (isMultiSelect: boolean): Value => (isMultiSelect ? {} : '');

/**
 * Convert the initial values array of strings to an object.
 *
 * @param {InitialSelectedItems} array
 * @returns {MultiSelectValue}
 */
const convertArrayToObject = (array: InitialSelectedItems): MultiSelectValue => {
  const multiSelectValue = {};
  array.forEach((selectedItem) => {
    multiSelectValue[selectedItem] = true;
  });
  return multiSelectValue;
};

export default Combobox;
