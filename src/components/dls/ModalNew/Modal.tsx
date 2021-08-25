import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import styles from './Modal.module.scss';

const Root = ({ children }) => (
  <DialogPrimitive.Root>
    <DialogPrimitive.Overlay className={styles.overlay} />
    {children}
  </DialogPrimitive.Root>
);

export const Modal = Root;
export const { Trigger } = DialogPrimitive;
export const Content = React.forwardRef<HTMLDivElement, any>(
  ({ children, ...props }, forwardedRef) => (
    <DialogPrimitive.Content {...props} ref={forwardedRef} className={styles.content}>
      {children}
    </DialogPrimitive.Content>
  ),
);
export const Title = ({ children }) => (
  <DialogPrimitive.Title className={styles.title}>{children}</DialogPrimitive.Title>
);
export const Subtitle = ({ children }) => (
  <DialogPrimitive.Description className={styles.subtitle}>{children}</DialogPrimitive.Description>
);
export const Actions = ({ children }) => <div className={styles.actionContainer}>{children}</div>;
export const Action = ({ children }) => <DialogPrimitive.Close>{children}</DialogPrimitive.Close>;
