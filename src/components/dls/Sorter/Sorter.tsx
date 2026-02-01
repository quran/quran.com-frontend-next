import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './Sorter.module.scss';

import IconContainer, { IconSize } from '@/dls/IconContainer/IconContainer';
import PopoverMenu, { PopoverMenuAlign } from '@/dls/PopoverMenu/PopoverMenu';
import ArrowRightIcon from '@/icons/arrow-right.svg';
import ArrowsVerticalIcon from '@/icons/arrows-vertical.svg';

export enum ArrowDirection {
  Up = 'up',
  Down = 'down',
  Right = 'right',
  Left = 'left',
}

export type SorterOption<T extends string> = {
  id: T;
  label: string;
  direction?: ArrowDirection;
};

type SorterProps<T extends string> = {
  options: SorterOption<T>[];
  selectedOptionId: T;
  onChange: (optionId: T) => void;
  onOpenChange?: (isOpen: boolean) => void;
  dataTestPrefix?: string;
};

const Sorter = <T extends string>({
  options,
  selectedOptionId,
  onChange,
  onOpenChange,
  dataTestPrefix = 'sorter',
}: SorterProps<T>) => {
  const { t } = useTranslation('common');

  const handleOpenChange = (isOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(isOpen);
    }
  };

  const getArrowDirectionClass = (direction?: ArrowDirection) => {
    switch (direction) {
      case ArrowDirection.Up:
        return styles.arrowUp;
      case ArrowDirection.Down:
        return styles.arrowDown;
      case ArrowDirection.Left:
        return styles.arrowLeft;
      case ArrowDirection.Right:
        return styles.arrowRight;
      default:
        return '';
    }
  };

  return (
    <PopoverMenu
      contentClassName={styles.popoverMenuContent}
      align={PopoverMenuAlign.END}
      trigger={
        <button
          type="button"
          className={styles.sortTrigger}
          data-has-selected={selectedOptionId !== null}
        >
          <IconContainer
            className={styles.iconWrapper}
            size={IconSize.Custom}
            shouldForceSetColors={false}
            shouldFlipOnRTL={false}
            icon={<ArrowsVerticalIcon />}
          />

          <span className={styles.sortText}>{t('sort.sort')}</span>
        </button>
      }
      onOpenChange={handleOpenChange}
    >
      {options.map((option) => (
        <PopoverMenu.Item
          shouldCloseMenuAfterClick
          key={option.id}
          onClick={() => onChange(option.id)}
          isSelected={option.id === selectedOptionId}
          dataTestId={`${dataTestPrefix}-option-${option.id}`}
          className={styles.menuItem}
        >
          <span className={styles.menuItemText}>
            {option.direction && (
              <IconContainer
                className={classNames(styles.optionIcon, getArrowDirectionClass(option.direction))}
                size={IconSize.Custom}
                shouldForceSetColors={false}
                shouldFlipOnRTL={false}
                icon={<ArrowRightIcon />}
              />
            )}

            {option.label}
          </span>
        </PopoverMenu.Item>
      ))}
    </PopoverMenu>
  );
};

export default Sorter;
