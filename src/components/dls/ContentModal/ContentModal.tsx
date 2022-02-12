import { useEffect, useRef, useImperativeHandle, ForwardedRef } from 'react';

import * as Dialog from '@radix-ui/react-dialog';
import { useRouter } from 'next/router';

import CloseIcon from '../../../../public/icons/close.svg';
import Button, { ButtonShape, ButtonVariant } from '../Button/Button';

import styles from './ContentModal.module.scss';

import ContentModalHandles from 'src/components/dls/ContentModal/types/ContentModalHandles';
import { fakeNavigate } from 'src/utils/navigation';

type ContentModalProps = {
  isOpen?: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  hasCloseButton?: boolean;
  url?: string;
  header?: React.ReactNode;
  innerRef?: ForwardedRef<ContentModalHandles>;
  // using innerRef instead of using function forwardRef so we can dynamically load this component https://github.com/vercel/next.js/issues/4957#issuecomment-413841689
};

const ContentModal = ({
  isOpen,
  onClose,
  hasCloseButton,
  children,
  url,
  header,
  innerRef,
}: ContentModalProps) => {
  const router = useRouter();

  const overlayRef = useRef<HTMLDivElement>();

  useImperativeHandle(innerRef, () => ({
    scrollToTop: () => {
      if (overlayRef.current) overlayRef.current.scrollTop = 0;
    },
  }));

  useEffect(() => {
    if (!url) return null;
    if (isOpen) fakeNavigate(url, router.locale);
    else fakeNavigate(router.asPath, router.locale);

    return () => {
      fakeNavigate(router.asPath, router.locale);
    };

    // we only want to run this effect when `isOpen` changed, not when `url` changed
    // this is important because sometime the url props is changed, but we don't want to trigger `fakeNavigate` again.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <Dialog.Root open={isOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} ref={overlayRef}>
          <Dialog.Content className={styles.contentWrapper} onInteractOutside={onClose}>
            <div className={styles.header}>
              {header}
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
            </div>
            <div className={styles.content}>{children}</div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
export default ContentModal;
