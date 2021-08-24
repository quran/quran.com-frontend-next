/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { ChangeEvent, useState, ReactNode, useEffect, RefObject, useCallback } from 'react';
import classNames from 'classnames';
import useScroll from '../../../../hooks/useScrollToElement';
import CaretIcon from '../../../../../public/icons/caret-down.svg';
import CloseIcon from '../../../../../public/icons/close.svg';
import Button, { ButtonVariant } from '../../Button/Button';
import SearchDropdownItem, { DropdownItem } from './SearchDropdownItem';
import styles from './SearchDropdown.module.scss';

export enum SearchDropdownSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
}

interface Props {
  onSelect: (selectedName: string, dropDownIdId: string) => void;
  selectorText: string;
  items: DropdownItem[];
  id: string;
  noResultText?: string;
  label?: string | ReactNode;
  searchPlaceHolder?: string;
  size?: SearchDropdownSize;
  selectedItem?: string;
  showClearSearchIcon?: boolean;
  allowSearching?: boolean;
}

const SCROLL_TO_SELECTED_ELEMENT_OPTIONS = {
  block: 'nearest', // 'block' relates to vertical alignment. see: https://stackoverflow.com/a/48635751/1931451 for nearest.
} as ScrollIntoViewOptions;

const SearchDropdown: React.FC<Props> = ({
  items,
  searchPlaceHolder = 'Type search query...',
  selectorText,
  selectedItem,
  allowSearching = true,
  showClearSearchIcon = true,
  noResultText = 'No results found.',
  label,
  id,
  size = SearchDropdownSize.Medium,
  onSelect,
}) => {
  const [isOpened, setIsOpened] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredItems, setFilteredItems] = useState<DropdownItem[]>(items);
  const [scrollToSelectedItem, selectedItemRef]: [() => void, RefObject<HTMLDivElement>] =
    useScroll(SCROLL_TO_SELECTED_ELEMENT_OPTIONS);

  // if there are any changes in the items, we should update the filteredItems.
  // this is necessary when the parent items are have initial empty value and
  // the actual values are fetched remotely and by the time they have a value,
  // filteredItems would have already been initialized with the initial items value
  // and the actual values wouldn't reflect.
  useEffect(() => {
    setFilteredItems(items);
  }, [items]);

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
      // we will pass the name of the selected item and the id of the whole search dropdown to avoid collision in-case we have the same name but for 2 different search dropdowns.
      onSelect(event.target.name, id);
      setIsOpened(false);
    },
    [id, onSelect],
  );

  /**
   * Handle when the user searches for an item.
   *
   * @param {React.FormEvent<HTMLInputElement>} event
   * @returns {void}
   */
  const onSearchQueryChange = (event: React.FormEvent<HTMLInputElement>): void => {
    const newSearchQuery = event.currentTarget.value;
    // if the search query is empty it means it has been cleared so we set the original items back.
    setFilteredItems(
      newSearchQuery === ''
        ? items
        : items.filter((item) =>
            // we convert the search query and the item's label to lowercase first then check if the label contains a part/all of the search query.
            item.label.toLowerCase().includes(newSearchQuery.toLowerCase()),
          ),
    );
    setSearchQuery(newSearchQuery);
  };

  const onClearButtonClicked = () => {
    setSearchQuery('');
    setFilteredItems(items);
  };

  return (
    <>
      {label && <p className={styles.label}>{label}</p>}
      <div
        className={classNames(styles.searchDropdownContainer, {
          [styles.smallSearchDropdownContainer]: size === SearchDropdownSize.Small,
          [styles.mediumSearchDropdownContainer]: size === SearchDropdownSize.Medium,
          [styles.largeSearchDropdownContainer]: size === SearchDropdownSize.Large,
        })}
      >
        <div
          onClick={onSelectorClicked}
          className={classNames(styles.container, styles.selectorContainer)}
        >
          {selectorText}
          <div
            className={classNames(styles.caretIconButton, {
              [styles.openedCaretIconButton]: isOpened,
            })}
          >
            <Button variant={ButtonVariant.Ghost}>
              <CaretIcon />
            </Button>
          </div>
        </div>
        <div
          className={classNames(styles.searchDropdownBodyContainer, {
            [styles.openedSearchDropdownBodyContainer]: isOpened,
          })}
        >
          {allowSearching && (
            <div className={classNames(styles.container, styles.searchInputContainer)}>
              <input
                type="text"
                className={styles.searchInput}
                placeholder={searchPlaceHolder}
                onChange={onSearchQueryChange}
                value={searchQuery}
              />
              {showClearSearchIcon && (
                <Button variant={ButtonVariant.Ghost} onClick={onClearButtonClicked}>
                  <CloseIcon />
                </Button>
              )}
            </div>
          )}
          <div className={styles.itemsContainer}>
            {filteredItems.map((item) => {
              const checked = selectedItem && selectedItem === item.name;
              const disabled = item.disabled || false;
              const itemId = `${id}-${item.id}`;
              return (
                <SearchDropdownItem
                  onItemSelected={onItemSelected}
                  key={itemId}
                  checked={checked}
                  disabled={disabled}
                  itemId={itemId}
                  selectedItemRef={selectedItemRef}
                  item={item}
                />
              );
            })}
            {!filteredItems.length && (
              <SearchDropdownItem noResultText={noResultText} checked={false} disabled isNotFound />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchDropdown;
