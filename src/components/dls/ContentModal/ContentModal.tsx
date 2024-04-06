import { useRef, useImperativeHandle, ForwardedRef } from 'react';

import * as Dialog from '@radix-ui/react-dialog';
import classNames from 'classnames';
import { useRouter } from 'next/router';

import Button, { ButtonShape, ButtonVariant } from '../Button/Button';

import styles from './ContentModal.module.scss';

import ContentModalHandles from '@/dls/ContentModal/types/ContentModalHandles';
import CloseIcon from '@/icons/close.svg';
import { isRTLLocale } from '@/utils/locale';

export enum ContentModalSize {
  SMALL = 'small',
  MEDIUM = 'medium',
}

type ContentModalProps = {
  isOpen?: boolean;
  onClose?: () => void;
  onEscapeKeyDown?: () => void;
  children: React.ReactNode;
  hasCloseButton?: boolean;
  hasHeader?: boolean;
  header?: React.ReactNode;
  innerRef?: ForwardedRef<ContentModalHandles>;
  // using innerRef instead of using function forwardRef so we can dynamically load this component https://github.com/vercel/next.js/issues/4957#issuecomment-413841689
  contentClassName?: string;
  size?: ContentModalSize;
  isFixedHeight?: boolean;
};

const SCROLLBAR_WIDTH = 15;

const ContentModal = ({
  isOpen,
  onClose,
  onEscapeKeyDown,
  hasCloseButton,
  children,
  header,
  innerRef,
  contentClassName,
  size = ContentModalSize.MEDIUM,
  isFixedHeight,
  hasHeader = true,
}: ContentModalProps) => {
  const overlayRef = useRef<HTMLDivElement>();
  const { locale } = useRouter();

  useImperativeHandle(innerRef, () => ({
    scrollToTop: () => {
      if (overlayRef.current) overlayRef.current.scrollTop = 0;
    },
  }));

  /**
   * We need to manually check what the user is targeting. If it lies at the
   * area where the scroll bar is (assuming the scrollbar width is equivalent
   * to SCROLLBAR_WIDTH), then we don't close the Modal, otherwise we do.
   * We also need to check if the current locale is RTL or LTR because the side
   * where the scrollbar is will be different and therefor the value of
   * {e.detail.originalEvent.offsetX} will be different.
   *
   * inspired by {@see https://github.com/radix-ui/primitives/issues/1280#issuecomment-1198248523}
   *
   * @param {any} e
   */
  const onPointerDownOutside = (e: any) => {
    const currentTarget = e.currentTarget as HTMLElement;

    const shouldPreventOnClose = isRTLLocale(locale)
      ? e.detail.originalEvent.offsetX < SCROLLBAR_WIDTH // left side of the screen clicked
      : e.detail.originalEvent.offsetX > currentTarget.clientWidth - SCROLLBAR_WIDTH; // right side of the screen clicked

    if (shouldPreventOnClose) {
      e.preventDefault();
      return;
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <Dialog.Root open={isOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} ref={overlayRef}>
          <Dialog.Content
            className={classNames(styles.contentWrapper, {
              [contentClassName]: contentClassName,
              [styles.small]: size === ContentModalSize.SMALL,
              [styles.medium]: size === ContentModalSize.MEDIUM,
              [styles.autoHeight]: !isFixedHeight,
            })}
            onEscapeKeyDown={onEscapeKeyDown}
            onPointerDownOutside={onPointerDownOutside}
          >
            {hasHeader && (
              <div className={styles.header}>
                {hasCloseButton && (
                  <Dialog.Close className={styles.closeIcon}>
                    <Button
                      variant={ButtonVariant.Ghost}
                      shape={ButtonShape.Circle}
                      onClick={onClose}
                    >
                      <CloseIcon />
                    </Button>
                  </Dialog.Close>
                )}
                {header}
              </div>
            )}

            <div className={styles.content}>{children}</div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
export default ContentModal;
