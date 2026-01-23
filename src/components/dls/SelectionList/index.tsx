import React, { useState } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import Button, { ButtonSize, ButtonVariant } from '../Button/Button';
import PopoverMenu from '../PopoverMenu/PopoverMenu';

import styles from './SelectionList.module.scss';

import CheckIcon from '@/icons/check.svg';
import ChevronSelectIcon from '@/icons/chevron-select.svg';

export interface SelectionItem {
  id: string;
  label: string;
  value: string;
}

interface SelectionListProps {
  id: string;
  title?: string;
  items: SelectionItem[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  minimumRequired?: number;
  className?: string;
  isPortalled?: boolean;
}

const SelectionList: React.FC<SelectionListProps> = ({
  id,
  title,
  items,
  selectedValues,
  onChange,
  minimumRequired = 1,
  className,
  isPortalled = true,
}) => {
  const { t } = useTranslation('common');
  const [isOpen, setIsOpen] = useState(false);

  const handleItemClick = (value: string) => {
    const isSelected = selectedValues.includes(value);

    if (isSelected) {
      // Don't allow deselecting if it would go below minimum
      if (selectedValues.length <= minimumRequired) return;
      onChange(selectedValues.filter((v) => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  // Get the label for the trigger button
  const getSelectedLabel = () => {
    if (selectedValues.length === 0) {
      return title || t('select');
    }
    if (selectedValues.length === 1) {
      const selectedItem = items.find((item) => item.value === selectedValues[0]);
      return selectedItem?.label || selectedValues[0];
    }
    return `${selectedValues.length} ${t('selected')}`;
  };

  return (
    <PopoverMenu
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      isPortalled={isPortalled}
      trigger={
        <Button
          className={classNames(styles.triggerButton, className)}
          variant={ButtonVariant.Compact}
          size={ButtonSize.Small}
          suffix={
            <span className={styles.chevronIcon}>
              <ChevronSelectIcon />
            </span>
          }
        >
          {getSelectedLabel()}
        </Button>
      }
      contentClassName={styles.popoverContent}
    >
      {title && <div className={styles.popoverTitle}>{title}</div>}
      <div className={styles.itemsContainer} id={id}>
        {items.map((item) => {
          const isSelected = selectedValues.includes(item.value);
          return (
            <PopoverMenu.Item
              key={item.id}
              onClick={() => handleItemClick(item.value)}
              isSelected={isSelected}
              icon={isSelected ? <CheckIcon /> : <span className={styles.emptyIcon} />}
              className={styles.menuItem}
            >
              {item.label}
            </PopoverMenu.Item>
          );
        })}
      </div>
    </PopoverMenu>
  );
};

export default SelectionList;
