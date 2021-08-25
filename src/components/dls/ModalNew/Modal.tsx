import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import styles from './Modal.module.scss';

const Modal = ({ children, trigger }) => (
  <DialogPrimitive.Root>
    <DialogPrimitive.Overlay className={styles.overlay} />
    {trigger}
    <Content>{children}</Content>
  </DialogPrimitive.Root>
);

const Content = React.forwardRef<HTMLDivElement, any>(({ children, ...props }, forwardedRef) => (
  <DialogPrimitive.Content {...props} ref={forwardedRef} className={styles.content}>
    {children}
  </DialogPrimitive.Content>
));

const Body = ({ children }) => <div className={styles.body}>{children}</div>;
const Title = ({ children }) => (
  <DialogPrimitive.Title className={styles.title}>{children}</DialogPrimitive.Title>
);
const Subtitle = ({ children }) => (
  <DialogPrimitive.Description className={styles.subtitle}>{children}</DialogPrimitive.Description>
);

const Actions = ({ children }) => <div className={styles.actionsContainer}>{children}</div>;
const Action = ({ children }) => (
  <DialogPrimitive.Close className={styles.action}>{children}</DialogPrimitive.Close>
);

Modal.Trigger = DialogPrimitive.Trigger;
Modal.Body = Body;
Modal.Title = Title;
Modal.Subtitle = Subtitle;
Modal.Actions = Actions;
Modal.Action = Action;

export default Modal;
