import * as Dialog from '@radix-ui/react-dialog';
import styles from './Modal.module.scss';

interface ModalProps {
  title: string;
}

const Modal: React.FC<ModalProps> = () => (
  <Dialog.Root>
    <Dialog.Trigger>Test</Dialog.Trigger>
    <Dialog.Overlay className={styles.overlay}>test</Dialog.Overlay>
    <Dialog.Content className={styles.content}>
      <Dialog.Title>test</Dialog.Title>
      <Dialog.Description>Test</Dialog.Description>
      <Dialog.Close>yep</Dialog.Close>
    </Dialog.Content>
  </Dialog.Root>
);

export default Modal;
