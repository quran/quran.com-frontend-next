import React, { useCallback, useEffect, useRef } from 'react';

import classNames from 'classnames';
import { useRouter } from 'next/router';

import Button, { ButtonShape, ButtonVariant } from '../Button/Button';

import styles from './ContentModal.module.scss';

import { ContentModalSize } from '@/dls/ContentModal/ContentModal';
import usePreventBodyScrolling from '@/hooks/usePreventBodyScrolling';
import CloseIcon from '@/icons/close.svg';
import { isRTLLocale } from '@/utils/locale';

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
};

const SCROLLBAR_WIDTH = 15;

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
}: FakeContentModalProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { locale } = useRouter();

  // Prevent body scrolling when modal is open
  usePreventBodyScrolling(true);

  /**
   * We need to manually check what the user is targeting. If it lies at the
   * area where the scroll bar is (assuming the scrollbar width is equivalent
   * to SCROLLBAR_WIDTH), then we don't close the Modal, otherwise we do.
   * We also need to check if the current locale is RTL or LTR because the side
   * where the scrollbar is will be different and therefor the value of
   * {e.offsetX} will be different.
   *
   * inspired by {@see https://github.com/radix-ui/primitives/issues/1280#issuecomment-1198248523}
   *
   * @param {React.PointerEvent} event
   */
  const onPointerDownOutside = (event: React.PointerEvent) => {
    const currentTarget = event.currentTarget as HTMLElement;
    const nativeEvent = event.nativeEvent as PointerEvent;

    const shouldPreventOnClose = isRTLLocale(locale)
      ? nativeEvent.offsetX < SCROLLBAR_WIDTH // left side of the screen clicked
      : nativeEvent.offsetX > currentTarget.clientWidth - SCROLLBAR_WIDTH; // right side of the screen clicked

    if (shouldPreventOnClose) {
      event.preventDefault();
      return;
    }

    if (onClose) onClose();
  };

  /**
   * Prevents Safari from focusing the first focusable element in the modal.
   * @param {React.FocusEvent} event
   */
  const handleOpenAutoFocus = useCallback((event: React.FocusEvent) => {
    if (event.defaultPrevented) return;
    event.preventDefault();
    contentRef.current?.focus({ preventScroll: true });
  }, []);

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
        onFocus={handleOpenAutoFocus}
        tabIndex={-1}
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
              <Button
                variant={ButtonVariant.Ghost}
                shape={ButtonShape.Circle}
                className={classNames(styles.closeIcon, closeIconClassName)}
                onClick={onClose}
                ariaLabel="Close modal"
                data-testid="fake-modal-close-button"
              >
                <CloseIcon />
              </Button>
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
