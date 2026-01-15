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

import ZIndexVariant from '@/types/enums/ZIndexVariant';

type ModalProps = {
  children: React.ReactNode;
  trigger?: React.ReactNode;
  isOpen?: boolean;
  isInvertedOverlay?: boolean;
  isBottomSheetOnMobile?: boolean;
  onClickOutside?: () => void;
  isPropagationStopped?: boolean;
  contentClassName?: string;
  overlayClassName?: string;
  onEscapeKeyDown?: () => void;
  size?: ModalSize;
  zIndexVariant?: ZIndexVariant;
  testId?: string;
};

const Modal = ({
  children,
  trigger,
  isOpen,
  onClickOutside,
  onEscapeKeyDown,
  isPropagationStopped,
  contentClassName,
  overlayClassName,
  isBottomSheetOnMobile = true,
  isInvertedOverlay = false,
  size,
  zIndexVariant,
  testId,
}: ModalProps) => (
  <DialogPrimitive.Root open={isOpen}>
    {trigger && (
      <DialogPrimitive.Trigger asChild>
        <div>{trigger}</div>
      </DialogPrimitive.Trigger>
    )}
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        className={classNames(styles.overlay, overlayClassName, {
          [styles.invertedOverlay]: isInvertedOverlay,
          [styles.zIndexModal]: zIndexVariant === ZIndexVariant.MODAL,
          [styles.zIndexHigh]: zIndexVariant === ZIndexVariant.HIGH,
          [styles.zIndexUltra]: zIndexVariant === ZIndexVariant.ULTRA,
        })}
      />
      <Content
        testId={testId}
        isPropagationStopped={isPropagationStopped}
        onEscapeKeyDown={onEscapeKeyDown}
        onPointerDownOutside={onClickOutside}
        isBottomSheetOnMobile={isBottomSheetOnMobile}
        contentClassName={classNames(contentClassName, {
          [styles.zIndexModal]: zIndexVariant === ZIndexVariant.MODAL,
          [styles.zIndexHigh]: zIndexVariant === ZIndexVariant.HIGH,
          [styles.zIndexUltra]: zIndexVariant === ZIndexVariant.ULTRA,
        })}
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
