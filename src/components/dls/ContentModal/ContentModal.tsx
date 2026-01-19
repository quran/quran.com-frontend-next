import { ForwardedRef, useCallback, useImperativeHandle, useRef } from 'react';

import * as Dialog from '@radix-ui/react-dialog';
import classNames from 'classnames';
import { useRouter } from 'next/router';

import Button, { ButtonShape, ButtonVariant } from '../Button/Button';

import styles from './ContentModal.module.scss';

import * as FakeContentModal from '@/dls/ContentModal/FakeContentModal';
import ContentModalHandles from '@/dls/ContentModal/types/ContentModalHandles';
import CloseIcon from '@/icons/close.svg';
import ZIndexVariant from '@/types/enums/ZIndexVariant';
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
  onClick?: (e: React.MouseEvent) => void;
  overlayClassName?: string;
  contentClassName?: string;
  innerContentClassName?: string;
  closeIconClassName?: string;
  headerClassName?: string;
  size?: ContentModalSize;
  isFixedHeight?: boolean;
  shouldBeFullScreen?: boolean;
  zIndexVariant?: ZIndexVariant;
  isBottomSheetOnMobile?: boolean;
  isFakeSEOFriendlyMode?: boolean;

  dataTestId?: string;
};

const SCROLLBAR_WIDTH = 15;

/**
 * IMPORTANT: FakeContentModal Compatibility Notice
 *
 * This component supports a "fake" mode (via `isFakeSEOFriendlyMode` prop) that uses FakeContentModal
 * components instead of Radix UI Dialog primitives. FakeContentModal exists for SEO purposes:
 * it renders modal content directly in the DOM (so search engines can index it) while still
 * looking and behaving like a modal for users. See FakeContentModal.tsx for details.
 *
 * When making changes to this component, please consider the following:
 *
 * 1. **Behavioral Changes**: If you're modifying open/close behavior, adding refs, or changing
 *    callbacks related to how ContentModal works (not styling), you may need to update
 *    FakeContentModal.tsx accordingly. Check existing uses of FakeContentModal to ensure
 *    compatibility.
 *
 * 2. **Props Filtering**: FakeContentModal omits certain behavioral props (like onEscapeKeyDown,
 *    onPointerDownOutside, onOpenAutoFocus) because it handles these internally. If you add
 *    new behavioral callbacks, consider whether they should be omitted in FakeContentContent
 *    to avoid breaking functionality or adding unnecessary side effects.
 *
 * 3. **Styling Changes**: Styling-related changes (className props, CSS modules) are generally
 *    safe and don't require FakeContentModal updates.
 *
 * 4. **SEO Considerations**: If you change the DOM structure or styling in ways that affect
 *    how search engines see the content, ensure FakeContentModal maintains the same structure
 *    to preserve SEO benefits.
 *
 * 5. **Testing**: When adding new props or behaviors, test with both `isFakeSEOFriendlyMode={false}` and
 *    `isFakeSEOFriendlyMode={true}` to ensure both implementations work correctly.
 *
 * See FakeContentModal.tsx for implementation details and current prop filtering logic.
 * @returns {React.ReactNode}
 */
const ContentModal = ({
  isOpen,
  onClose,
  onEscapeKeyDown,
  hasCloseButton,
  children,
  header,
  innerRef,
  overlayClassName,
  contentClassName,
  innerContentClassName,
  closeIconClassName,
  headerClassName,
  size = ContentModalSize.MEDIUM,
  isFixedHeight,
  hasHeader = true,
  onClick,
  shouldBeFullScreen = false,
  zIndexVariant,
  isBottomSheetOnMobile = true,
  isFakeSEOFriendlyMode: isFake = false,
  dataTestId,
}: ContentModalProps) => {
  const overlayRef = useRef<HTMLDivElement>();
  const contentRef = useRef<HTMLDivElement>(null);
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

  /**
   * Prevents Safari from focusing the first focusable element in the modal.
   * @param {Event} event
   */
  const handleOpenAutoFocus = useCallback((event: Event) => {
    if (event.defaultPrevented) return;
    event.preventDefault();
    contentRef.current?.focus({ preventScroll: true });
  }, []);

  const Root = isFake ? FakeContentModal.FakeContentRoot : Dialog.Root;
  const Portal = isFake ? FakeContentModal.FakeContentPortal : Dialog.Portal;
  const Overlay = isFake ? FakeContentModal.FakeContentOverlay : Dialog.Overlay;
  const Content = isFake ? FakeContentModal.FakeContentContent : Dialog.Content;
  const Close = isFake ? FakeContentModal.FakeContentClose : Dialog.Close;

  // Handle dialog open state changes - ensures onClose is called when dialog closes
  // This fixes the issue where clicking outside the modal didn't properly trigger onClose
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open && onClose) {
        onClose();
      }
    },
    [onClose],
  );

  return (
    <Root open={isOpen} onClose={onClose} onOpenChange={handleOpenChange}>
      <Portal>
        <Overlay
          ref={overlayRef}
          data-is-fake-seo-friendly-mode={isFake}
          className={classNames(styles.overlay, overlayClassName, {
            [styles.fullScreen]: shouldBeFullScreen,
            [styles.zIndexModal]: zIndexVariant === ZIndexVariant.MODAL,
            [styles.zIndexHigh]: zIndexVariant === ZIndexVariant.HIGH,
            [styles.zIndexUltra]: zIndexVariant === ZIndexVariant.ULTRA,
          })}
        >
          <Content
            {...(onClick && { onClick })}
            ref={contentRef}
            className={classNames(styles.contentWrapper, contentClassName, {
              [styles.small]: size === ContentModalSize.SMALL,
              [styles.medium]: size === ContentModalSize.MEDIUM,
              [styles.autoHeight]: !isFixedHeight,
              [styles.isBottomSheetOnMobile]: isBottomSheetOnMobile,
            })}
            onEscapeKeyDown={onEscapeKeyDown}
            onPointerDownOutside={onPointerDownOutside}
            onOpenAutoFocus={handleOpenAutoFocus}
            data-testid={dataTestId ?? 'root-dialog'}
          >
            {hasHeader && (
              <div className={classNames(styles.header, headerClassName)}>
                {hasCloseButton && (
                  <Close className={classNames(styles.closeIcon, closeIconClassName)}>
                    <Button
                      variant={ButtonVariant.Ghost}
                      shape={ButtonShape.Circle}
                      onClick={onClose}
                    >
                      <CloseIcon />
                    </Button>
                  </Close>
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
          </Content>
        </Overlay>
      </Portal>
    </Root>
  );
};
export default ContentModal;
