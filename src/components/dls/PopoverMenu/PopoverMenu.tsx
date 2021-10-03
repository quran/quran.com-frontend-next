/* eslint-disable react/no-multi-comp */

import * as PrimitiveDropdownMenu from '@radix-ui/react-dropdown-menu';

import styles from './PopoverMenu.module.scss';

type PopoverMenuProps = {
  isOpen?: boolean;
  children: React.ReactNode;
  trigger?: React.ReactNode;
};
const PopoverMenu = ({ children, isOpen, trigger }: PopoverMenuProps) => {
  return (
    <PrimitiveDropdownMenu.Root open={isOpen}>
      {trigger && (
        <PrimitiveDropdownMenu.Trigger asChild>
          <span>{trigger}</span>
        </PrimitiveDropdownMenu.Trigger>
      )}
      <PrimitiveDropdownMenu.Content className={styles.content}>
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
};
PopoverMenu.Item = ({ children, icon, onClick, isDisabled }: PopoverMenuItemProps) => {
  return (
    <PrimitiveDropdownMenu.Item className={styles.item} onClick={onClick} disabled={isDisabled}>
      {icon && <span className={styles.iconWrapper}>{icon}</span>}
      {children}
    </PrimitiveDropdownMenu.Item>
  );
};

PopoverMenu.Divider = () => {
  return <PrimitiveDropdownMenu.Separator className={styles.separator} />;
};

export default PopoverMenu;
