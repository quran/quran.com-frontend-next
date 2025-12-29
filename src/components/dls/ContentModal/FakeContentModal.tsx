import React, { useEffect, useRef } from 'react';

import classNames from 'classnames';

import Button, { ButtonShape, ButtonVariant } from '../Button/Button';

import styles from './ContentModal.module.scss';

import { ContentModalSize } from '@/dls/ContentModal/ContentModal';
import usePreventBodyScrolling from '@/hooks/usePreventBodyScrolling';
import CloseIcon from '@/icons/close.svg';

type FakeContentModalProps = {
  children: React.ReactNode;
  onClose?: () => void;
  hasCloseButton?: boolean;
  hasHeader?: boolean;
  header?: React.ReactNode;
  overlayClassName?: string;
  contentClassName?: string;
  innerContentClassName?: string;
  closeIconClassName?: string;
  headerClassName?: string;
  size?: ContentModalSize;
  isFixedHeight?: boolean;
  shouldBeFullScreen?: boolean;
  isBottomSheetOnMobile?: boolean;

  closeAriaLabel?: string;
};

const FakeContentModal = ({
  onClose,
  hasCloseButton = true,
  children,
  header,
  overlayClassName,
  contentClassName,
  innerContentClassName,
  closeIconClassName,
  headerClassName,
  size = ContentModalSize.MEDIUM,
  isFixedHeight,
  hasHeader = true,
  shouldBeFullScreen = false,
  isBottomSheetOnMobile = true,
  closeAriaLabel,
}: FakeContentModalProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Prevent body scrolling when modal is open
  usePreventBodyScrolling(true);

  const onPointerDownOutside = (event: React.PointerEvent<HTMLDivElement>) => {
    const target = event.target as Node;
    if (event.button !== 0) return;
    if (contentRef.current?.contains(target)) return;
    onClose?.();
  };

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onClose) onClose();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      onPointerDown={onPointerDownOutside}
      className={classNames(styles.overlay, overlayClassName, {
        [styles.fullScreen]: shouldBeFullScreen,
      })}
    >
      <div
        ref={contentRef}
        className={classNames(styles.contentWrapper, contentClassName, {
          [styles.small]: size === ContentModalSize.SMALL,
          [styles.medium]: size === ContentModalSize.MEDIUM,
          [styles.autoHeight]: !isFixedHeight,
          [styles.isBottomSheetOnMobile]: isBottomSheetOnMobile,
        })}
      >
        {hasHeader && (
          <div className={classNames(styles.header, headerClassName)}>
            {hasCloseButton && (
              <div className={classNames(styles.closeIcon, closeIconClassName)}>
                <Button
                  variant={ButtonVariant.Ghost}
                  shape={ButtonShape.Circle}
                  data-testid="fake-modal-close-button"
                  ariaLabel={closeAriaLabel}
                  onClick={onClose}
                >
                  <CloseIcon />
                </Button>
              </div>
            )}
            {header}
          </div>
        )}

        <div
          className={classNames(styles.content, innerContentClassName)}
          data-testid="fake-modal-content"
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default FakeContentModal;
