import React, { useCallback, useState, useRef, useEffect } from 'react';

import * as RadixPopover from '@radix-ui/react-popover';
import classNames from 'classnames';

import styles from './PopoverSelect.module.scss';
import usePopoverSelectKeyboardNavigation from './usePopoverSelectKeyboardNavigation';

import CaretIcon from '@/icons/caret-down.svg';

export interface PopoverSelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

interface PopoverSelectProps {
  id: string;
  name: string;
  options: PopoverSelectOption[];
  disabled?: boolean;
  value?: string | number;
  placeholder?: string;
  onChange?: (value: string | number) => void;
  className?: string;
  fullWidth?: boolean;
}

const PopoverSelect: React.FC<PopoverSelectProps> = ({
  name,
  id,
  onChange,
  options,
  value,
  disabled = false,
  placeholder = 'Select an option',
  className,
  fullWidth = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));
  const displayLabel = selectedOption?.label || placeholder;
  const hasValue = !!selectedOption;

  const handleSelect = useCallback(
    (optionValue: string | number) => {
      if (onChange) onChange(optionValue);
      setIsOpen(false);
    },
    [onChange],
  );

  const { handleKeyDown } = usePopoverSelectKeyboardNavigation({
    disabled,
    isOpen,
    options,
    highlightedIndex,
    setIsOpen,
    setHighlightedIndex,
    handleSelect,
  });

  useEffect(() => {
    if (isOpen) {
      const currentIndex = options.findIndex((opt) => String(opt.value) === String(value));
      if (currentIndex >= 0) {
        setHighlightedIndex(currentIndex);
      } else {
        const firstEnabledIndex = options.findIndex((opt) => !opt.disabled);
        setHighlightedIndex(firstEnabledIndex >= 0 ? firstEnabledIndex : -1);
      }
    }
  }, [isOpen, options, value]);

  return (
    <RadixPopover.Root open={isOpen} onOpenChange={setIsOpen}>
      <RadixPopover.Trigger asChild disabled={disabled}>
        <button
          ref={triggerRef}
          type="button"
          id={id}
          name={name}
          className={classNames(styles.trigger, className, {
            [styles.fullWidth]: fullWidth,
            [styles.disabled]: disabled,
            [styles.open]: isOpen,
            [styles.placeholder]: !hasValue,
          })}
          onKeyDown={handleKeyDown}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label={displayLabel}
          disabled={disabled}
          data-testid="popover-select-trigger"
        >
          <span className={styles.label}>{displayLabel}</span>
          <span className={classNames(styles.arrow, { [styles.arrowOpen]: isOpen })}>
            <CaretIcon />
          </span>
        </button>
      </RadixPopover.Trigger>

      <RadixPopover.Portal>
        <RadixPopover.Content
          className={styles.content}
          align="start"
          sideOffset={4}
          style={{ inlineSize: triggerRef.current?.offsetWidth }}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div
            ref={listRef}
            role="listbox"
            className={styles.list}
            aria-labelledby={id}
            data-testid="popover-select-list"
          >
            {options.map((option, index) => {
              const isSelected = String(option.value) === String(value);
              const isHighlighted = index === highlightedIndex;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={option.disabled}
                  className={classNames(styles.option, {
                    [styles.optionSelected]: isSelected,
                    [styles.optionHighlighted]: isHighlighted,
                    [styles.optionDisabled]: option.disabled,
                  })}
                  onClick={() => handleSelect(option.value)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  data-testid={`popover-select-option-${option.value}`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  );
};

export default PopoverSelect;
