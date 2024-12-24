/* eslint-disable react/no-multi-comp */

import { useEffect, useState } from 'react';

import * as PrimitiveDropdownMenu from '@radix-ui/react-dropdown-menu';
import classNames from 'classnames';

import styles from './PopoverMenu.module.scss';

import useDirection from '@/hooks/useDirection';
import { Direction } from '@/utils/locale';

export enum PopoverMenuExpandDirection {
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
  expandDirection?: PopoverMenuExpandDirection;
  contentClassName?: string;
  shouldClose?: boolean;
};

const PopoverMenu = ({
  children,
  isOpen,
  trigger,
  isPortalled = true,
  isModal = true,
  shouldClose = true,
  onOpenChange,
  expandDirection: side = PopoverMenuExpandDirection.BOTTOM,
  contentClassName,
}: PopoverMenuProps) => {
  const [open, setOpen] = useState(isOpen);
  const direction = useDirection();
  const content = (
    <PrimitiveDropdownMenu.Content
      className={classNames(styles.content, contentClassName)}
      side={side}
    >
      {children}
    </PrimitiveDropdownMenu.Content>
  );

  const handleOpenChange = (newOpen: boolean) => {
    if (!shouldClose) {
      return;
    }

    if (onOpenChange) {
      onOpenChange(newOpen);
    }

    setOpen(newOpen);
  };

  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

  return (
    <PrimitiveDropdownMenu.Root
      dir={direction as Direction}
      open={open}
      modal={isModal}
      onOpenChange={handleOpenChange}
    >
      {trigger && (
        <PrimitiveDropdownMenu.Trigger asChild onClick={() => setOpen(true)}>
          <span>{trigger}</span>
        </PrimitiveDropdownMenu.Trigger>
      )}
      {isPortalled ? (
        <PrimitiveDropdownMenu.Portal>{content}</PrimitiveDropdownMenu.Portal>
      ) : (
        content
      )}
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
  id?: string;
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
  id,
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
      id={id}
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
