import React, { useState } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import PopoverMenu from '../PopoverMenu/PopoverMenu';

import styles from './CompactSelector.module.scss';

import ChevronDownIcon from '@/icons/chevron-down.svg';
import { toLocalizedNumber } from '@/utils/locale';

export interface SelectorItem {
  id: string;
  label: string;
  value: string;
}

interface CompactSelectorProps {
  id: string;
  items: SelectorItem[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  /** If true, allows multiple selection. Default: false (single selection) */
  isMultiSelect?: boolean;
  /** Minimum number of items that must be selected (only applies to multi-select) */
  minimumRequired?: number;
  triggerClassName?: string;
}

const CompactSelector: React.FC<CompactSelectorProps> = ({
  id,
  items,
  selectedValues,
  onChange,
  isMultiSelect = false,
  minimumRequired = 1,
  triggerClassName,
}) => {
  const { t, lang } = useTranslation('quran-reader');
  const [isOpen, setIsOpen] = useState(false);

  const handleItemClick = (value: string) => {
    if (isMultiSelect) {
      const isSelected = selectedValues.includes(value);
      if (isSelected) {
        // Don't allow deselecting if it would go below minimum
        if (selectedValues.length <= minimumRequired) return;
        onChange(selectedValues.filter((v) => v !== value));
      } else {
        onChange([...selectedValues, value]);
      }
    } else {
      // Single selection mode - just replace the value
      onChange([value]);
      setIsOpen(false);
    }
  };

  // Get the label for the trigger button
  const getSelectedLabel = () => {
    if (selectedValues.length === 0 && items.length > 0) {
      return items[0].label;
    }
    if (selectedValues.length === 1) {
      const selectedItem = items.find((item) => item.value === selectedValues[0]);
      return selectedItem?.label || selectedValues[0];
    }
    // For multi-select with more than one selection
    const localizedCount = toLocalizedNumber(selectedValues.length, lang);
    return t('selected-count', { count: localizedCount });
  };

  return (
    <PopoverMenu
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      isPortalled
      shouldUseModalZIndex
      sideOffset={-28}
      trigger={
        <button
          type="button"
          className={classNames(styles.trigger, triggerClassName)}
          aria-expanded={isOpen}
        >
          <span className={styles.triggerText}>{getSelectedLabel()}</span>
          <span className={classNames(styles.chevronIcon, { [styles.chevronOpen]: isOpen })}>
            <ChevronDownIcon />
          </span>
        </button>
      }
      contentClassName={styles.popoverContent}
    >
      <div className={styles.popoverHeader}>{t('common:languages')}</div>
      <div className={styles.itemsContainer} id={id}>
        {items.map((item) => {
          const isSelected = selectedValues.includes(item.value);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleItemClick(item.value)}
              className={classNames(styles.menuItem, { [styles.menuItemSelected]: isSelected })}
            >
              <span className={styles.itemLabel}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </PopoverMenu>
  );
};

export default CompactSelector;
