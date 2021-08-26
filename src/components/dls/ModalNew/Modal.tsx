import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import styles from './Modal.module.scss';

type ModalProps = {
  children: React.ReactNode;
  trigger?: React.ReactNode;
  active?: boolean;
  onClickOutside?: () => void;
};
const Modal = ({ children, trigger, active, onClickOutside }: ModalProps) => (
  <DialogPrimitive.Root open={active}>
    <DialogPrimitive.Overlay className={styles.overlay} />
    {trigger && (
      <DialogPrimitive.Trigger as="div" className={styles.trigger}>
        {trigger}
      </DialogPrimitive.Trigger>
    )}
    <Content onInteractOutside={onClickOutside}>{children}</Content>
  </DialogPrimitive.Root>
);

const Content = ({ children, ...props }) => (
  <DialogPrimitive.Content {...props} className={styles.content}>
    {children}
  </DialogPrimitive.Content>
);

const Body = ({ children }) => <div className={styles.body}>{children}</div>;
const Header = ({ children }) => <div className={styles.header}>{children}</div>;
const Title = ({ children }) => (
  <DialogPrimitive.Title className={styles.title}>{children}</DialogPrimitive.Title>
);
const Subtitle = ({ children }) => (
  <DialogPrimitive.Description className={styles.subtitle}>{children}</DialogPrimitive.Description>
);

const Footer = ({ children }) => <footer className={styles.footer}>{children}</footer>;
type ActionProps = {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  closeModal?: boolean;
};

const Action = ({ children, onClick, disabled }: ActionProps) => (
  <DialogPrimitive.Close className={styles.action} onClick={onClick} disabled={disabled}>
    {children}
  </DialogPrimitive.Close>
);

Modal.Body = Body;
Modal.Header = Header;
Modal.Title = Title;
Modal.Subtitle = Subtitle;
Modal.Footer = Footer;
Modal.Action = Action;

// optional hook, if we want the modal to be controlled
export const useModal = (defaultState = false): [boolean, () => void, () => void] => {
  const [active, setActive] = React.useState<boolean>(defaultState);
  const close = () => {
    setActive(false);
  };
  const open = () => {
    setActive(true);
  };

  return [active as boolean, open, close];
};

export default Modal;
