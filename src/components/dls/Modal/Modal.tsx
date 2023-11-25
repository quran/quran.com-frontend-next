import React from 'react';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import classNames from 'classnames';

import Action from './Action';
import Body from './Body';
import CloseAction from './CloseAction';
import Content, { ModalSize } from './Content';
import Footer from './Footer';
import Header from './Header';
import styles from './Modal.module.scss';
import Subtitle from './Subtitle';
import Title from './Title';

type ModalProps = {
  children: React.ReactNode;
  trigger?: React.ReactNode;
  isOpen?: boolean;
  isInvertedOverlay?: boolean;
  isBottomSheetOnMobile?: boolean;
  onClickOutside?: () => void;
  isPropagationStopped?: boolean;
  contentClassName?: string;
  onEscapeKeyDown?: () => void;
  size?: ModalSize;
};

const Modal = ({
  children,
  trigger,
  isOpen,
  onClickOutside,
  onEscapeKeyDown,
  isPropagationStopped,
  contentClassName,
  isBottomSheetOnMobile = true,
  isInvertedOverlay = false,
  size,
}: ModalProps) => (
  <DialogPrimitive.Root open={isOpen}>
    {trigger && (
      <DialogPrimitive.Trigger asChild>
        <div>{trigger}</div>
      </DialogPrimitive.Trigger>
    )}
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        className={classNames(styles.overlay, { [styles.invertedOverlay]: isInvertedOverlay })}
      />
      <Content
        isPropagationStopped={isPropagationStopped}
        onEscapeKeyDown={onEscapeKeyDown}
        onPointerDownOutside={onClickOutside}
        isBottomSheetOnMobile={isBottomSheetOnMobile}
        contentClassName={contentClassName}
        size={size}
      >
        {children}
      </Content>
    </DialogPrimitive.Portal>
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
