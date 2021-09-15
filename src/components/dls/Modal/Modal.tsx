import React, { MouseEvent } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import styles from './Modal.module.scss';

type ModalProps = {
  children: React.ReactNode;
  trigger?: React.ReactNode;
  open?: boolean;
  onClickOutside?: () => void;
  shouldStopPropagation?: boolean;
};
const Modal = ({ children, trigger, open, onClickOutside, shouldStopPropagation }: ModalProps) => (
  <DialogPrimitive.Root open={open}>
    <DialogPrimitive.Overlay className={styles.overlay} />
    {trigger && <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>}
    <Content shouldStopPropagation={shouldStopPropagation} onInteractOutside={onClickOutside}>
      {children}
    </Content>
  </DialogPrimitive.Root>
);

const Content = ({ children, shouldStopPropagation, ...props }) => (
  <DialogPrimitive.Content
    {...props}
    className={styles.content}
    onClick={(e) => {
      /**
       * Radix is using react portal,
       * React Portal bubble events events to the parent element,
       * even if they are not in the same DOM Tree, for us this could
       * cause problems. For example, calling Modal inside AudioPlayer
       * could cause the AudioPlayer to `expand` / `minimize`
       *
       * References:
       * - https://reactjs.org/docs/portals.html#event-bubbling-through-portals
       * - https://jwwnz.medium.com/react-portals-and-event-bubbling-8df3e35ca3f1
       */
      if (shouldStopPropagation) e.stopPropagation();
    }}
  >
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

const Footer = ({ children }) => <div className={styles.footer}>{children}</div>;
type ActionProps = {
  children: React.ReactNode;
  onClick?: (e: MouseEvent) => void;
  disabled?: boolean;
};

const CloseAction = ({ children, onClick, disabled }: ActionProps) => (
  <DialogPrimitive.Close className={styles.action} onClick={onClick} disabled={disabled}>
    {children}
  </DialogPrimitive.Close>
);

const Action = ({ children, onClick, disabled }: ActionProps) => (
  <button type="button" className={styles.action} onClick={onClick} disabled={disabled}>
    {children}
  </button>
);

Modal.Body = Body;
Modal.Header = Header;
Modal.Title = Title;
Modal.Subtitle = Subtitle;
Modal.Footer = Footer;
Modal.Action = Action;
Modal.CloseAction = CloseAction;

export default Modal;
