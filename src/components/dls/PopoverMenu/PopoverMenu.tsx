/* eslint-disable react/no-multi-comp */

import * as PrimitiveDropdownMenu from '@radix-ui/react-dropdown-menu';
import classNames from 'classnames';

import styles from './PopoverMenu.module.scss';

import useDirection from 'src/hooks/useDirection';
import { Direction } from 'src/utils/locale';

export enum PopoverMenuSide {
  TOP = 'top',
  RIGHT = 'right',
  BOTTOM = 'bottom',
  LEFT = 'left',
}

type PopoverMenuProps = {
  isOpen?: boolean;
  children: React.ReactNode;
  trigger?: React.ReactNode;
  isPortalled?: boolean;
  isModal?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: PopoverMenuSide;
};
const PopoverMenu = ({
  children,
  isOpen,
  trigger,
  isPortalled = true,
  isModal = true,
  onOpenChange,
  side = PopoverMenuSide.BOTTOM,
}: PopoverMenuProps) => {
  const direction = useDirection();
  return (
    <PrimitiveDropdownMenu.Root
      dir={direction as Direction}
      open={isOpen}
      modal={isModal}
      {...(onOpenChange && { onOpenChange })}
    >
      {trigger && (
        <PrimitiveDropdownMenu.Trigger asChild>
          <span>{trigger}</span>
        </PrimitiveDropdownMenu.Trigger>
      )}
      <PrimitiveDropdownMenu.Content className={styles.content} portalled={isPortalled} side={side}>
        {children}
      </PrimitiveDropdownMenu.Content>
    </PrimitiveDropdownMenu.Root>
  );
};

type PopoverMenuItemProps = {
  children: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
  isDisabled?: boolean;
  shouldCloseMenuAfterClick?: boolean;
  shouldFlipOnRTL?: boolean;
  className?: string;
  isSelected?: boolean;
  shouldStopPropagation?: boolean;
};
PopoverMenu.Item = ({
  children,
  icon,
  onClick,
  isDisabled,
  shouldCloseMenuAfterClick = false,
  shouldFlipOnRTL = false,
  className,
  isSelected,
  shouldStopPropagation,
}: PopoverMenuItemProps) => {
  return (
    <PrimitiveDropdownMenu.Item
      className={classNames(styles.item, className, { [styles.selected]: isSelected })}
      onClick={(e) => {
        if (shouldStopPropagation) e.stopPropagation();
        if (!shouldCloseMenuAfterClick) {
          // PopoverMenu automatically close itself when one of item is clicked
          // this code prevent that, so it only close when user click outside of the PopoverMenu
          e.preventDefault();
        }
        if (onClick) onClick();
      }}
      disabled={isDisabled}
    >
      {icon && (
        <span
          className={classNames(styles.iconWrapper, {
            [styles.shouldFlipOnRTL]: shouldFlipOnRTL,
          })}
        >
          {icon}
        </span>
      )}
      {children}
    </PrimitiveDropdownMenu.Item>
  );
};

PopoverMenu.Divider = () => {
  return <PrimitiveDropdownMenu.Separator className={styles.separator} />;
};

export default PopoverMenu;
