import * as Dialog from '@radix-ui/react-dialog';

import CloseIcon from '../../../../public/icons/close.svg';
import Button, { ButtonShape, ButtonType, ButtonVariant } from '../Button/Button';

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
            <Dialog.Close className={styles.closeIcon}>
              <Button variant={ButtonVariant.Ghost} shape={ButtonShape.Circle}>
                <CloseIcon />
              </Button>
            </Dialog.Close>
            {children}
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default EmbeddableContent;
