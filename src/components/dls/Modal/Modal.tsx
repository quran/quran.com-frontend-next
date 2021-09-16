import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import styles from './Modal.module.scss';
import Content from './Content';
import Body from './Body';
import Header from './Header';
import Footer from './Footer';
import Action from './Action';
import Title from './Title';
import Subtitle from './Subtitle';
import CloseAction from './CloseAction';

type ModalProps = {
  children: React.ReactNode;
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onClickOutside?: () => void;
  isPropagationStopped?: boolean;
};
const Modal = ({ children, trigger, isOpen, onClickOutside, isPropagationStopped }: ModalProps) => (
  <DialogPrimitive.Root open={isOpen}>
    <DialogPrimitive.Overlay className={styles.overlay} />
    {trigger && (
      <DialogPrimitive.Trigger asChild>
        <div>{trigger}</div>
      </DialogPrimitive.Trigger>
    )}
    <Content isPropagationStopped={isPropagationStopped} onInteractOutside={onClickOutside}>
      {children}
    </Content>
  </DialogPrimitive.Root>
);

Modal.Body = Body;
Modal.Header = Header;
Modal.Title = Title;
Modal.Subtitle = Subtitle;
Modal.Footer = Footer;
Modal.Action = Action;
Modal.CloseAction = CloseAction;

export default Modal;
