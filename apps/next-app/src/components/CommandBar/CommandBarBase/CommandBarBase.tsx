import * as Dialog from '@radix-ui/react-dialog';

import styles from './CommandBarBase.module.scss';

type CommandBarBaseProps = {
  onClickOutside: () => void;
  children: React.ReactNode;
  isOpen: boolean;
};

const CommandBarBase = ({ onClickOutside, children, isOpen }: CommandBarBaseProps) => {
  return (
    <Dialog.Root open={isOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.content} onInteractOutside={onClickOutside}>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default CommandBarBase;
