import { useEffect } from 'react';

import * as Dialog from '@radix-ui/react-dialog';
import { useRouter } from 'next/router';

import CloseIcon from '../../../../public/icons/close.svg';
import Button, { ButtonShape, ButtonVariant } from '../Button/Button';

import styles from './ContentModal.module.scss';

import { fakeNavigate } from 'src/utils/navigation';

type ContentModalProps = {
  isOpen?: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  hasCloseButton?: boolean;
  url?: string;
};

const ContentModal = ({ isOpen, onClose, hasCloseButton, children, url }: ContentModalProps) => {
  const router = useRouter();

  useEffect(() => {
    if (!url) return null;
    if (isOpen) fakeNavigate(url);
    else fakeNavigate(router.asPath);

    return () => {
      fakeNavigate(router.asPath);
    };

    // we only want to run this effect when `isOpen` changed, not when `url` changed
    // this is important because sometime the url props is changed, but we don't want to trigger `fakeNavigate` again.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <Dialog.Root open={isOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay}>
          <Dialog.Content className={styles.contentWrapper} onInteractOutside={onClose}>
            {hasCloseButton && (
              <Dialog.Close className={styles.closeIcon}>
                <Button variant={ButtonVariant.Ghost} shape={ButtonShape.Circle} onClick={onClose}>
                  <CloseIcon />
                </Button>
              </Dialog.Close>
            )}

            <div className={styles.content}>{children}</div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ContentModal;
