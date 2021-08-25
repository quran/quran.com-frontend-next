import * as DialogPrimitive from '@radix-ui/react-dialog';
import styles from './Modal.module.scss';

interface ModalProps {
  title: string;
}

const Root = ({ children, ...props }) => (
  <DialogPrimitive.Root {...props}>
    <div className={styles.overlay} />
    {children}
  </DialogPrimitive.Root>
);

const Modal: React.FC<ModalProps> = () => (
  <Root>
    <DialogPrimitive.Trigger>Edit profile</DialogPrimitive.Trigger>
    <DialogPrimitive.Content className={styles.content}>
      <DialogPrimitive.Title>test</DialogPrimitive.Title>
      <DialogPrimitive.Description>another test</DialogPrimitive.Description>
      <DialogPrimitive.Close />
    </DialogPrimitive.Content>
  </Root>
);

export default Modal;
