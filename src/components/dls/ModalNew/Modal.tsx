import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import styles from './Modal.module.scss';
import Button, { ButtonProps } from '../Button/Button';

const Modal = ({ children, trigger }) => (
  <DialogPrimitive.Root>
    <DialogPrimitive.Overlay className={styles.overlay} />
    {trigger}
    <Content>{children}</Content>
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

const Actions = ({ children }) => <div className={styles.actionsContainer}>{children}</div>;
type ActionProps = {
  children: React.ReactNode;
  onClick?: () => void;
};
const Action = ({ children, onClick }: ActionProps) => (
  <DialogPrimitive.Close className={styles.action} onClick={onClick}>
    {children}
  </DialogPrimitive.Close>
);

const Trigger = ({ children, ...props }: ButtonProps) => (
  <DialogPrimitive.Trigger {...props} as={Button}>
    {children}
  </DialogPrimitive.Trigger>
);

Modal.Trigger = Trigger; // This is an alias for a button. it supports all button props
Modal.Body = Body;
Modal.Header = Header;
Modal.Title = Title;
Modal.Subtitle = Subtitle;
Modal.Actions = Actions;
Modal.Action = Action;

export default Modal;
