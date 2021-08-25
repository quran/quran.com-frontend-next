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
} from 'react';
import classNames from 'classnames';
import useOutsideClickDetector from 'src/hooks/useOutsideClickDetector';
import useKeyPressedDetector from 'src/hooks/useKeyPressedDetector';
import useScroll from '../../../../hooks/useScrollToElement';
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

interface Props {
  id: string;
  items: DropdownItem[];
  onChange?: (selectedName: string, dropDownIdId: string) => void;
  initialInputValue?: string;
  emptyMessage?: string;
  label?: string | ReactNode;
  placeholder?: string;
  size?: ComboboxSize;
  value?: string;
  clearable?: boolean;
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
  emptyMessage = 'No results',
  label,
  id,
  size = ComboboxSize.Medium,
  onChange,
}) => {
  const [isOpened, setIsOpened] = useState(false);
  const [inputValue, setInputValue] = useState<string>(initialInputValue || '');
  const [selectedValue, setSelectedValue] = useState(value || '');
  const [filteredItems, setFilteredItems] = useState<DropdownItem[]>(items);
  const [scrollToSelectedItem, selectedItemRef]: [() => void, RefObject<HTMLDivElement>] =
    useScroll(SCROLL_TO_SELECTED_ELEMENT_OPTIONS);
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
    setSelectedValue(value);
  }, [value]);

  // if there are any changes in the initialInputValue, we should update the inputValue.
  useEffect(() => {
    setInputValue(initialInputValue);
  }, [initialInputValue]);

  useEffect(() => {
    // once the dropdown is opened, scroll to the selected item.
    if (isOpened) {
      scrollToSelectedItem();
    }
  }, [isOpened, scrollToSelectedItem]);

  const onSelectorClicked = () => {
    setIsOpened((prevIsOpened) => !prevIsOpened);
  };

  /**
   * Handle when an item is selected.
   *
   * @param {ChangeEvent<HTMLInputElement>} event
   */
  const onItemSelected = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const { itemLabel } = event.target.dataset;
      const selectedItemName = event.target.name;
      setSelectedValue(selectedItemName);
      if (onChange) {
        // we will pass the name of the selected item and the id of the whole search dropdown to avoid collision in-case we have the same name but for 2 different search dropdowns.
        onChange(selectedItemName, id);
      }
      setInputValue(itemLabel);
      setIsOpened(false);
    },
    [id, onChange],
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

  const onClearButtonClicked = (event: MouseEvent) => {
    event.stopPropagation();
    setInputValue('');
    setSelectedValue('');
    if (onChange) {
      onChange('', id);
    }
    setFilteredItems(items);
  };

  return (
    <>
      {label && <p className={styles.label}>{label}</p>}
      <div
        role="combobox"
        ref={comboBoxRef}
        aria-haspopup="listbox"
        aria-expanded={isOpened}
        aria-owns={id}
        className={classNames(styles.comboboxContainer, {
          [styles.disabledContainer]: disabled,
          [styles.smallComboboxContainer]: size === ComboboxSize.Small,
          [styles.mediumComboboxContainer]: size === ComboboxSize.Medium,
          [styles.largeComboboxContainer]: size === ComboboxSize.Large,
        })}
      >
        <div
          onClick={onSelectorClicked}
          className={classNames(styles.container, {
            [styles.disabled]: disabled,
          })}
        >
          <div aria-hidden="true" className={styles.searchIconContainer}>
            <IconSearch />
          </div>
          <input
            type="text"
            autoComplete="off"
            aria-autocomplete="list"
            role="searchbox"
            spellCheck="false"
            aria-controls={id}
            aria-label={placeholder}
            className={classNames(styles.searchInputContainer, {
              [styles.activeInput]: !disabled && !hasError && isOpened,
              [styles.disabledInput]: disabled,
              [styles.hasError]: hasError,
            })}
            placeholder={placeholder}
            disabled={disabled}
            onChange={onInputValueChange}
            value={inputValue}
          />
          {!inputValue && (
            <div
              className={classNames(styles.caretIconButton, {
                [styles.openedCaretIconButton]: isOpened,
              })}
              aria-label="Show more"
            >
              <CaretIcon />
            </div>
          )}
          {clearable && inputValue && (
            <button
              type="button"
              onClick={onClearButtonClicked}
              className={classNames(styles.clearIconContainer, { [styles.disabled]: disabled })}
              aria-label="Clear selected value"
            >
              <CloseIcon />
            </button>
          )}
        </div>
        <div
          className={classNames(styles.comboboxBodyContainer, {
            [styles.openedComboboxBodyContainer]: isOpened,
            [styles.smallComboboxBodyContainer]: size === ComboboxSize.Small,
            [styles.mediumComboboxBodyContainer]: size === ComboboxSize.Medium,
            [styles.largeComboboxBodyContainer]: size === ComboboxSize.Large,
          })}
          aria-modal="true"
          role="dialog"
        >
          <div className={styles.itemsContainer} role="listbox">
            {filteredItems.map((item) => {
              const checked = selectedValue && selectedValue === item.name;
              const isItemDisabled = disabled === true || item.disabled === true;
              const itemId = `${id}-${item.id}`;
              return (
                <ComboboxItem
                  onItemSelected={onItemSelected}
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

export default Combobox;
