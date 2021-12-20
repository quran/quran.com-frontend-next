import React from 'react';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import classNames from 'classnames';

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
  isInvertedOverlay?: boolean;
  isBottomSheetOnMobile?: boolean;
  onClickOutside?: () => void;
  isPropagationStopped?: boolean;
  contentClassName?: string;
  isFullView?: boolean;
};
const Modal = ({
  children,
  trigger,
  isOpen,
  onClickOutside,
  isPropagationStopped,
  contentClassName,
  isBottomSheetOnMobile = true,
  isInvertedOverlay = false,
  isFullView,
}: ModalProps) => (
  <DialogPrimitive.Root open={isOpen}>
    <DialogPrimitive.Overlay
      className={classNames(styles.overlay, { [styles.invertedOverlay]: isInvertedOverlay })}
    />
    {trigger && (
      <DialogPrimitive.Trigger asChild>
        <div>{trigger}</div>
      </DialogPrimitive.Trigger>
    )}
    <Content
      isFullView={isFullView}
      isPropagationStopped={isPropagationStopped}
      onInteractOutside={onClickOutside}
      isBottomSheetOnMobile={isBottomSheetOnMobile}
      contentClassName={contentClassName}
    >
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
