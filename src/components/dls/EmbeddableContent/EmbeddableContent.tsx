import * as Dialog from '@radix-ui/react-dialog';

import styles from './EmbeddableContent.module.scss';

type EmbeddableContentProps = {
  isOpen?: boolean;
  onClickOutside?: () => void;
  children: React.ReactNode;
};
const EmbeddableContent = ({ children, isOpen, onClickOutside }: EmbeddableContentProps) => {
  return (
    <Dialog.Root open={isOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay}>
          <Dialog.Content className={styles.content} onInteractOutside={onClickOutside}>
            {children}
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default EmbeddableContent;
