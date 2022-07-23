import { useRef, useImperativeHandle, ForwardedRef } from 'react';

import * as Dialog from '@radix-ui/react-dialog';
import classNames from 'classnames';

import CloseIcon from '../../../../public/icons/close.svg';
import Button, { ButtonShape, ButtonVariant } from '../Button/Button';

import styles from './ContentModal.module.scss';

import ContentModalHandles from 'src/components/dls/ContentModal/types/ContentModalHandles';

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
  header?: React.ReactNode;
  innerRef?: ForwardedRef<ContentModalHandles>;
  // using innerRef instead of using function forwardRef so we can dynamically load this component https://github.com/vercel/next.js/issues/4957#issuecomment-413841689
  contentClassName?: string;
  size?: ContentModalSize;
  isFixedHeight?: boolean;
};

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
}: ContentModalProps) => {
  const overlayRef = useRef<HTMLDivElement>();

  useImperativeHandle(innerRef, () => ({
    scrollToTop: () => {
      if (overlayRef.current) overlayRef.current.scrollTop = 0;
    },
  }));

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
            onPointerDownOutside={onClose}
          >
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
            <div className={styles.content}>{children}</div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
export default ContentModal;
