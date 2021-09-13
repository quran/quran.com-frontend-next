import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import classNames from 'classnames';
import styles from './Modal.module.scss';

type ModalProps = {
  children: React.ReactNode;
  trigger?: React.ReactNode;
  triggerClassName?: string;
  open?: boolean;
  onClickOutside?: () => void;
  shouldStopPropagation?: boolean;
};
const Modal = ({
  children,
  trigger,
  open,
  onClickOutside,
  triggerClassName,
  shouldStopPropagation = true,
}: ModalProps) => (
  <DialogPrimitive.Root open={open}>
    <DialogPrimitive.Overlay className={styles.overlay} />
    {trigger && (
      <DialogPrimitive.Trigger
        as="div"
        className={classNames(styles.trigger, { [triggerClassName]: triggerClassName })}
      >
        {trigger}
      </DialogPrimitive.Trigger>
    )}
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
  onClick?: (e) => void;
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
