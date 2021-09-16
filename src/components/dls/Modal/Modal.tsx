import React from 'react';

import * as DialogPrimitive from '@radix-ui/react-dialog';

import Action from './Action';
import Body from './Body';
import CloseAction from './CloseAction';
import Content from './Content';
import Footer from './Footer';
import Header from './Header';
import styles from './Modal.module.scss';
import Subtitle from './Subtitle';
import Title from './Title';

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
