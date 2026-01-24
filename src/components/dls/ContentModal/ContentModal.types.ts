import { ForwardedRef } from 'react';

import ContentModalHandles from '@/dls/ContentModal/types/ContentModalHandles';
import ZIndexVariant from '@/types/enums/ZIndexVariant';

export enum ContentModalSize {
  SMALL = 'small',
  MEDIUM = 'medium',
}

export type ContentModalProps = {
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

export const SCROLLBAR_WIDTH = 15;

/**
 * Creates a handler for pointer down outside events.
 * Prevents closing when clicking on scrollbar area.
 *
 * @param {string} locale - Current locale for RTL detection.
 * @param {Function} onClose - Close callback.
 * @param {Function} isRTLLocale - RTL locale checker function.
 * @returns {Function} Event handler function.
 */
export const createPointerDownOutsideHandler =
  (locale: string, onClose: (() => void) | undefined, isRTLLocale: (l: string) => boolean) =>
  (e: any) => {
    const currentTarget = e.currentTarget as HTMLElement;
    const shouldPreventOnClose = isRTLLocale(locale)
      ? e.detail.originalEvent.offsetX < SCROLLBAR_WIDTH
      : e.detail.originalEvent.offsetX > currentTarget.clientWidth - SCROLLBAR_WIDTH;

    if (shouldPreventOnClose) {
      e.preventDefault();
      return;
    }
    if (onClose) {
      onClose();
    }
  };
