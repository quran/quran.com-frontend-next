import * as Dialog from '@radix-ui/react-dialog';

import CloseIcon from '../../../../public/icons/close.svg';
import Button, { ButtonShape, ButtonVariant } from '../Button/Button';

import styles from './EmbeddableContent.module.scss';

type EmbeddableContentProps = {
  isOpen?: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  hasCloseButton?: boolean;
};

const EmbeddableContent = ({
  isOpen,
  onClose,
  hasCloseButton,
  children,
}: EmbeddableContentProps) => {
  return (
    <Dialog.Root open={isOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay}>
          <Dialog.Content className={styles.contentWrapper} onInteractOutside={onClose}>
            {hasCloseButton && (
              <Dialog.Close className={styles.closeIcon}>
                <Button variant={ButtonVariant.Ghost} shape={ButtonShape.Circle} onClick={onClose}>
                  <CloseIcon />
                </Button>
              </Dialog.Close>
            )}

            <div className={styles.content}>{children}</div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default EmbeddableContent;
