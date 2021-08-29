/* eslint-disable jsx-a11y/role-has-required-aria-props */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, {
  MouseEvent,
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
import useScroll from '../../../../hooks/useScrollToElement';
import useFocus from '../../../../hooks/useFocusElement';
import CaretIcon from '../../../../../public/icons/caret-down.svg';
import IconSearch from '../../../../../public/icons/search.svg';
import CloseIcon from '../../../../../public/icons/close.svg';
import ComboboxItem, { DropdownItem } from './ComboboxItem';
import styles from './Combobox.module.scss';

export enum ComboboxSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
}

type MultiSelectValue = Record<string, boolean>;
type Value = string | MultiSelectValue;
interface Props {
  id: string;
  items: DropdownItem[];
  onChange?: (selectedName: Value, dropDownIdId: string) => void;
  initialInputValue?: string;
  emptyMessage?: string;
  label?: string | ReactNode;
  placeholder?: string;
  size?: ComboboxSize;
  value?: Value;
  clearable?: boolean;
  isMultiSelect?: boolean;
  tagsLimit?: number;
  disabled?: boolean;
  hasError?: boolean;
}

const SCROLL_TO_SELECTED_ELEMENT_OPTIONS = {
  block: 'nearest', // 'block' relates to vertical alignment. see: https://stackoverflow.com/a/48635751/1931451 for nearest.
} as ScrollIntoViewOptions;

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
  const [selectedValue, setSelectedValue] = useState<Value>(
    () => value || getDefaultValue(isMultiSelect),
  );
  const [filteredItems, setFilteredItems] = useState<DropdownItem[]>(items);
  const [scrollToSelectedItem, selectedItemRef]: [() => void, RefObject<HTMLDivElement>] =
    useScroll(SCROLL_TO_SELECTED_ELEMENT_OPTIONS);
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
      setSelectedValue(value);
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

  // listener for when the backspace is clicked.
  useEffect(() => {
    if (shouldDeleteLastTag) {
      setSelectedValue((prevSelectedValue: MultiSelectValue) => {
        const newSelectedValues = { ...prevSelectedValue };
        const lastTag = Object.keys(newSelectedValues).pop();
        delete newSelectedValues[lastTag];
        return newSelectedValues;
      });
    }
  }, [shouldDeleteLastTag]);

  // listen to any change in selectedValue and invoke the callback if it exists.
  useEffect(() => {
    if (onChange) {
      // we will pass the name of the selected item and the id of the whole search dropdown to avoid collision in-case we have the same name but for 2 different search dropdowns.
      onChange(selectedValue, id);
    }
  }, [id, onChange, selectedValue]);

  useEffect(() => {
    // once the dropdown is opened, scroll to the selected item.
    if (isOpened) {
      scrollToSelectedItem();
    }
  }, [isOpened, scrollToSelectedItem]);

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
          return newSelectedValues;
        });
        setInputValue(''); // reset the input value even if it's selecting.
        setFilteredItems(items); // reset the filtered items.
      } else {
        setInputValue(isUnSelect ? '' : itemLabel);
        const newSelectedValue = isUnSelect ? '' : selectedItemName;
        setSelectedValue(newSelectedValue);
      }
      setIsOpened(false); // close the items container
    },
    [isMultiSelect, items],
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
   * @param {MouseEvent} event
   */
  const onClearButtonClicked = (event: MouseEvent) => {
    event.stopPropagation();
    setInputValue('');
    const defaultSelectedValue = getDefaultValue(isMultiSelect);
    setSelectedValue(defaultSelectedValue);
    setFilteredItems(items);
  };

  /**
   * Handle when removing a tag.
   *
   * @param {MouseEvent} event
   * @param {string} tag
   */
  const onRemoveTagClicked = (event: MouseEvent, tag: string) => {
    event.stopPropagation();
    const toBeRemovedTag = items.find((item) => item.label === tag);
    setSelectedValue((prevSelectedValues: MultiSelectValue) => {
      const newSelectedValues = { ...prevSelectedValues };
      delete newSelectedValues[toBeRemovedTag.name];
      return newSelectedValues;
    });
  };

  const shouldShowCaret =
    (!isMultiSelect && !inputValue) || (isMultiSelect && !inputValue && !tags.length);

  const shouldShowClear =
    clearable &&
    ((!isMultiSelect && !!inputValue) || (isMultiSelect && (!!inputValue || !!tags.length)));

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
          <span
            className={classNames(styles.iconContainer, styles.selectSearch)}
            unselectable="on"
            aria-hidden="true"
          >
            <span role="img" className={styles.icon}>
              <IconSearch />
            </span>
          </span>
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
                    <span
                      className={classNames(styles.item, {
                        [styles.largeItem]: size === ComboboxSize.Large,
                      })}
                    >
                      <span className={styles.itemContent}>{tag}</span>
                      <span
                        className={styles.itemRemove}
                        unselectable="on"
                        aria-hidden="true"
                        onClick={(event) => {
                          onRemoveTagClicked(event, tag);
                        }}
                      >
                        <span role="img" aria-label="close" className={styles.icon}>
                          <CloseIcon />
                        </span>
                      </span>
                    </span>
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
          {shouldShowCaret && (
            <div
              className={classNames(styles.caretIconButton, {
                [styles.openedCaretIconButton]: isOpened,
              })}
              aria-label="Show more"
            >
              <CaretIcon />
            </div>
          )}
          {shouldShowClear && (
            <span
              className={styles.clearIconContainer}
              unselectable="on"
              aria-hidden="true"
              onClick={onClearButtonClicked}
            >
              <span role="img" aria-label="close-circle" className={styles.icon}>
                <CloseIcon />
              </span>
            </span>
          )}
        </div>
        <div
          className={classNames(styles.comboboxBodyContainer, {
            [styles.openedComboboxBodyContainer]: isOpened,
            [styles.largeComboboxBodyContainer]: size === ComboboxSize.Large,
          })}
          aria-modal="true"
          role="dialog"
        >
          <div className={styles.itemsContainer} role="listbox">
            {filteredItems.map((item) => {
              let checked = false;
              if (selectedValue) {
                if (!isMultiSelect && selectedValue === item.name) {
                  checked = true;
                } else if (isMultiSelect && selectedValue[item.name] !== undefined) {
                  checked = true;
                }
              }
              // prevent selecting when the tags limit has been reached.
              const preventSelecting = tagsLimit && tags && tags.length >= tagsLimit;
              const isItemDisabled =
                disabled === true || item.disabled === true || preventSelecting;
              const itemId = `${id}-${item.id}`;
              return (
                <ComboboxItem
                  onItemSelectedChange={onItemSelectedChange}
                  key={itemId}
                  checked={checked}
                  disabled={isItemDisabled}
                  itemId={itemId}
                  selectedItemRef={selectedItemRef}
                  item={item}
                />
              );
            })}
            {!filteredItems.length && (
              <ComboboxItem emptyMessage={emptyMessage} checked={false} disabled isNotFound />
            )}
          </div>
        </div>
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

export default Combobox;
