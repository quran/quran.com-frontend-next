/* eslint-disable react/no-multi-comp */

import * as PrimitiveDropdownMenu from '@radix-ui/react-dropdown-menu';
import classNames from 'classnames';

import styles from './PopoverMenu.module.scss';

import useDirection from 'src/hooks/useDirection';
import { Direction } from 'src/utils/locale';

type PopoverMenuProps = {
  isOpen?: boolean;
  children: React.ReactNode;
  trigger?: React.ReactNode;
  isPortalled?: boolean;
};
const PopoverMenu = ({ children, isOpen, trigger, isPortalled = true }: PopoverMenuProps) => {
  const direction = useDirection();
  return (
    <PrimitiveDropdownMenu.Root dir={direction as Direction} open={isOpen}>
      {trigger && (
        <PrimitiveDropdownMenu.Trigger asChild>
          <span>{trigger}</span>
        </PrimitiveDropdownMenu.Trigger>
      )}
      <PrimitiveDropdownMenu.Content className={classNames(styles.content)} portalled={isPortalled}>
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
  className?: string;
};
PopoverMenu.Item = ({
  children,
  icon,
  onClick,
  isDisabled,
  shouldCloseMenuAfterClick = false,
  className,
}: PopoverMenuItemProps) => {
  return (
    <PrimitiveDropdownMenu.Item
      className={classNames(styles.item, className)}
      onClick={(e) => {
        if (!shouldCloseMenuAfterClick) {
          // PopoverMenu automatically close itself when one of item is clicked
          // this code prevent that, so it only close when user click outside of the PopoverMenu
          e.preventDefault();
        }
        if (onClick) onClick();
      }}
      disabled={isDisabled}
    >
      {icon && <span className={styles.iconWrapper}>{icon}</span>}
      {children}
    </PrimitiveDropdownMenu.Item>
  );
};

PopoverMenu.Divider = () => {
  return <PrimitiveDropdownMenu.Separator className={styles.separator} />;
};

export default PopoverMenu;
