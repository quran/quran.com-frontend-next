import React, { useCallback, useEffect, useRef, useState } from 'react';

// This dependency already exists via @radix-ui/react-dialog so we have not added any new package.
import { FocusScope } from '@radix-ui/react-focus-scope';
import classNames from 'classnames';

import Button, { ButtonShape, ButtonVariant } from '../Button/Button';

import styles from './ContentModal.module.scss';

import { ContentModalSize } from '@/dls/ContentModal/ContentModal';
import usePreventBodyScrolling from '@/hooks/usePreventBodyScrolling';
import useSafeTimeout from '@/hooks/useSafeTimeout';
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
};

// Sneakily less than the CSS transition duration to avoid any visual glitches.
const ANIMATION_DURATION = 380;

/**
 * FakeContentModal is a lightweight, SEO-oriented version of `ContentModal`.
 *
 * It intentionally reuses the same styles and a similar DOM structure as `ContentModal`,
 * but avoids depending on the full modal implementation (e.g. portals) while still
 * providing essential accessibility features like focus trapping for a better user
 * experience. This keeps the content in the DOM for SEO crawlers while ensuring
 * keyboard navigation works properly when needed.
 *
 * Use this component only in places where we need modal-like styling/markup for content
 * that is primarily rendered for search engines or non-interactive views. For regular,
 * interactive modals in the app, always prefer `ContentModal` instead.
 *
 * If the public structure or styling contract of `ContentModal` changes in ways that
 * are important for SEO, make sure to review and update this "fake" counterpart to keep
 * the rendered HTML consistent where required.
 *
 * @returns {JSX.Element} The rendered FakeContentModal component
 */
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
  const [isOpen, setIsOpen] = useState(true);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const setSafeTimeout = useSafeTimeout();

  const isVisible = isOpen || isAnimatingOut;

  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    setIsAnimatingOut(true);
    setIsOpen(false);
    if (onClose) onClose();

    setSafeTimeout(() => {
      setIsAnimatingOut(false);
    }, ANIMATION_DURATION);
  }, [onClose, setSafeTimeout]);

  usePreventBodyScrolling(isVisible);

  const onPointerDownOutside = (event: React.PointerEvent<HTMLDivElement>) => {
    const target = event.target as Node;
    if (event.button !== 0) return;
    if (contentRef.current?.contains(target)) return;
    handleClose();
  };

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handleClose();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [handleClose]);

  if (!isVisible) return null;
  const dataState = isOpen ? 'fake-open' : 'closed';

  return (
    <FocusScope loop trapped>
      <div
        ref={overlayRef}
        onPointerDown={onPointerDownOutside}
        role="dialog"
        aria-modal={isVisible}
        data-state={dataState}
        className={classNames(styles.overlay, overlayClassName, {
          [styles.fullScreen]: shouldBeFullScreen,
        })}
      >
        <div
          ref={contentRef}
          data-state={dataState}
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
                    data-testid="modal-close-button"
                    onClick={handleClose}
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
            data-testid="modal-content"
          >
            {children}
          </div>
        </div>
      </div>
    </FocusScope>
  );
};

export default FakeContentModal;
