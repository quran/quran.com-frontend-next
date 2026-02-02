import { useCallback, useImperativeHandle, useMemo, useRef } from 'react';

import * as Dialog from '@radix-ui/react-dialog';
import classNames from 'classnames';
import { useRouter } from 'next/router';

import Button, { ButtonShape, ButtonVariant } from '../Button/Button';

import styles from './ContentModal.module.scss';
import {
  ContentModalProps,
  ContentModalSize,
  createPointerDownOutsideHandler,
} from './ContentModal.types';

import * as FakeContentModal from '@/dls/ContentModal/FakeContentModal';
import CloseIcon from '@/icons/close.svg';
import ZIndexVariant from '@/types/enums/ZIndexVariant';
import { isRTLLocale } from '@/utils/locale';

export { ContentModalSize } from './ContentModal.types';

/**
 * Content modal component with support for fake SEO-friendly mode.
 * See ContentModal.types.ts for prop definitions.
 *
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

  const onPointerDownOutside = useMemo(
    () => createPointerDownOutsideHandler(locale, onClose, isRTLLocale),
    [locale, onClose],
  );

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

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open && onClose) onClose();
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
              data-content-modal
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
