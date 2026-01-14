import React from 'react';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import Button, { ButtonShape, ButtonVariant } from '../Button/Button';

import Action from './Action';
import Body from './Body';
import CloseAction from './CloseAction';
import Content, { ModalSize } from './Content';
import Footer from './Footer';
import Header from './Header';
import styles from './Modal.module.scss';
import Subtitle from './Subtitle';
import Title from './Title';

import CloseIcon from '@/icons/close.svg';
import ZIndexVariant from '@/types/enums/ZIndexVariant';

type BaseModalProps = {
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
};

type ModalWithCloseButtonProps = BaseModalProps & {
  hasCloseButton: true;
  onClose: () => void;
};

type ModalWithoutCloseButtonProps = BaseModalProps & {
  hasCloseButton?: false;
  onClose?: () => void;
};

type ModalProps = ModalWithCloseButtonProps | ModalWithoutCloseButtonProps;

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
  hasCloseButton = false,
  onClose,
}: ModalProps) => {
  const { t } = useTranslation('common');

  return (
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
          {hasCloseButton && (
            <DialogPrimitive.Close asChild className={styles.closeButton} onClick={onClose}>
              <Button
                variant={ButtonVariant.Ghost}
                shape={ButtonShape.Circle}
                ariaLabel={t('close')}
              >
                <CloseIcon />
              </Button>
            </DialogPrimitive.Close>
          )}
          {children}
        </Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

Modal.Body = Body;
Modal.Header = Header;
Modal.Title = Title;
Modal.Subtitle = Subtitle;
Modal.Footer = Footer;
Modal.Action = Action;
Modal.CloseAction = CloseAction;

export default Modal;
