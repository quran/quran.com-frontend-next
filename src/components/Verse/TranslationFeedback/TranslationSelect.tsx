import React, { useState, useMemo, useRef, useEffect } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './TranslationSelect.module.scss';

import { SelectOption } from '@/dls/Forms/Select';
import PopoverMenu, { PopoverMenuExpandDirection } from '@/dls/PopoverMenu/PopoverMenu';
import CaretIcon from '@/icons/caret-down.svg';

interface TranslationSelectProps {
  selectedTranslationId: string;
  selectOptions: SelectOption[];
  onTranslationChange: (value: string | number) => void;
  id?: string;
  name?: string;
  dataTestId?: string;
}

const TranslationSelect: React.FC<TranslationSelectProps> = ({
  selectedTranslationId,
  selectOptions,
  onTranslationChange,
  id,
  name,
  dataTestId,
}) => {
  const { t } = useTranslation('common');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedOption = useMemo(
    () => selectOptions.find((opt) => String(opt.value) === String(selectedTranslationId)),
    [selectOptions, selectedTranslationId],
  );

  const displayLabel = selectedOption?.label || t('translation-feedback.select');

  const handleSelect = (value: string | number) => {
    onTranslationChange(value);
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const wrapperElement = wrapperRef.current;
    if (triggerRef.current && wrapperElement && isMenuOpen) {
      const width = triggerRef.current.offsetWidth;
      wrapperElement.style.setProperty('--trigger-width', `${width}px`);
    }
    return () => {
      if (wrapperElement) {
        wrapperElement.style.removeProperty('--trigger-width');
      }
    };
  }, [isMenuOpen]);

  return (
    <div ref={wrapperRef} className={styles.selectWrapper} data-testid={dataTestId}>
      <PopoverMenu
        isOpen={isMenuOpen}
        onOpenChange={setIsMenuOpen}
        expandDirection={PopoverMenuExpandDirection.BOTTOM}
        contentClassName={styles.popoverContent}
        isPortalled={false}
        trigger={
          <button
            ref={triggerRef}
            type="button"
            id={id}
            name={name}
            className={classNames(styles.trigger, {
              [styles.triggerOpen]: isMenuOpen,
            })}
            aria-haspopup="listbox"
            aria-expanded={isMenuOpen}
            aria-label={displayLabel}
            data-testid="translation-select-trigger"
          >
            <span className={styles.triggerLabel}>{displayLabel}</span>
            <span
              className={classNames(styles.triggerArrow, {
                [styles.triggerArrowOpen]: isMenuOpen,
              })}
            >
              <CaretIcon />
            </span>
          </button>
        }
      >
        {selectOptions.map((option) => (
          <PopoverMenu.Item
            key={option.value}
            isSelected={String(option.value) === String(selectedTranslationId)}
            shouldCloseMenuAfterClick
            isDisabled={option.disabled}
            onClick={() => handleSelect(option.value)}
            dataTestId={`translation-select-option-${option.value}`}
          >
            {option.label}
          </PopoverMenu.Item>
        ))}
      </PopoverMenu>
    </div>
  );
};

export default TranslationSelect;
