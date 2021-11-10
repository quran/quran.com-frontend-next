import * as Dialog from '@radix-ui/react-dialog';

import styles from './CommandBarBase.module.scss';

const CommandBarBase = ({ onClickOutside, children, isOpen }) => {
  return (
    <Dialog.Root open={isOpen}>
      <Dialog.Overlay className={styles.overlay} />
      <Dialog.Content className={styles.content} onInteractOutside={onClickOutside}>
        {children}
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default CommandBarBase;
