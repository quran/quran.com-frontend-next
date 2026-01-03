/**
 * FakeContentModal - SEO-oriented alternative to ContentModal
 *
 * Renders modal content directly in the DOM (for SEO crawlers) while maintaining modal appearance
 * and behavior. Avoids portals but provides focus trapping and keyboard navigation. Reuses
 * ContentModal styles and DOM structure.
 *
 * Use only for SEO-critical content. For regular modals, use ContentModal instead.
 *
 * Unlike ContentModal, FakeContentModal cannot be controlled externally (no open/close props).
 * Renders open by default, closes via internal interaction only (ESC, outside click, close button).
 *
 * For external control (not recommended): use useFakeContentModal hook.
 *
 * When modifying: ensure compatibility with ContentModal.tsx.
 */

/* eslint-disable max-lines, react/no-multi-comp */

import React, {
  useCallback,
  useRef,
  useState,
  createContext,
  useContext,
  useMemo,
  forwardRef,
} from 'react';

import * as Dialog from '@radix-ui/react-dialog';
// This dependency already exists via @radix-ui/react-dialog so we have not added any new package.
import { FocusScope } from '@radix-ui/react-focus-scope';
import { useHotkeys } from 'react-hotkeys-hook';

import usePreventBodyScrolling from '@/hooks/usePreventBodyScrolling';
import useSafeTimeout from '@/hooks/useSafeTimeout';
import omit from '@/utils/object';

// Sneakily less than the CSS transition duration to avoid any visual glitches.
const ANIMATION_DURATION = 380;

interface FakeContentModalContextValue {
  overlayRef: React.MutableRefObject<HTMLDivElement | null>;
  contentRef: React.MutableRefObject<HTMLDivElement | null>;

  isOpen: boolean;
  isAnimatingOut: boolean;
  isVisible: boolean;
  dataState: string;

  setIsAnimatingOut: (value: boolean) => void;
  setIsOpen: (value: boolean) => void;
  handleClose: () => void;
  onPointerDownOutside: (event: React.PointerEvent<HTMLDivElement>) => void;
}

const FakeContentModalContext = createContext<FakeContentModalContextValue | null>(null);

const useFakeContentModal = () => {
  const context = useContext(FakeContentModalContext);
  if (!context) throw new Error('useFakeContentModal must be used within a FakeContentRoot');
  return context;
};

interface FakeContentRootProps extends Dialog.DialogProps {
  onClose?: () => void;
}

const FakeContentRoot = ({ children, onClose }: FakeContentRootProps) => {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const [isOpen, setIsOpen] = useState(true);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const setSafeTimeout = useSafeTimeout();

  const handleClose = useCallback(() => {
    setIsAnimatingOut(true);
    setIsOpen(false);
    if (onClose) onClose();

    setSafeTimeout(() => {
      setIsAnimatingOut(false);
    }, ANIMATION_DURATION);
  }, [onClose, setSafeTimeout]);

  const isVisible = isOpen || isAnimatingOut;

  usePreventBodyScrolling(isVisible);

  const onPointerDownOutside = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const target = event.target as Node;
      if (event.button !== 0) return;
      if (contentRef.current?.contains(target)) return;
      handleClose();
    },
    [handleClose],
  );

  // Using 'fake-open' (instead of 'open') as the data-state to prevent entry animation
  const dataState = isOpen ? 'fake-open' : 'closed';

  const value: FakeContentModalContextValue = useMemo(
    () => ({
      overlayRef,
      contentRef,

      isOpen,
      isAnimatingOut,
      isVisible,
      dataState,

      setIsAnimatingOut,
      setIsOpen,
      handleClose,
      onPointerDownOutside,
    }),
    [isOpen, isAnimatingOut, isVisible, dataState, handleClose, onPointerDownOutside],
  );

  if (!isVisible) return null;

  return (
    <FakeContentModalContext.Provider value={value}>{children}</FakeContentModalContext.Provider>
  );
};

const FakeContentPortal = ({ children }: Dialog.DialogPortalProps) => children;

const FakeContentOverlay = forwardRef<HTMLDivElement, Dialog.DialogOverlayProps>(
  ({ children, ...props }, ref) => {
    const { overlayRef, isVisible, dataState, onPointerDownOutside } = useFakeContentModal();

    return (
      <div
        {...props}
        onPointerDown={onPointerDownOutside}
        role="dialog"
        aria-modal={isVisible}
        data-state={dataState}
        ref={(node) => {
          overlayRef.current = node;
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            // eslint-disable-next-line no-param-reassign
            ref.current = node;
          }
        }}
      >
        {children}
      </div>
    );
  },
);

FakeContentOverlay.displayName = 'FakeContentOverlay';

const FakeContentContent = forwardRef<HTMLDivElement, Dialog.DialogContentProps>(
  ({ children, onEscapeKeyDown, ...props }, ref) => {
    const { dataState, handleClose, isVisible, contentRef } = useFakeContentModal();

    /**
     * Omit Radix UI behavioral props - handled internally by FakeContentModal.
     * onEscapeKeyDown uses react-hotkeys-hook, onPointerDownOutside is in FakeContentOverlay,
     * onOpenAutoFocus not needed (no Radix focus management).
     */
    const filteredProps = omit(props, [
      'onPointerDownOutside',
      'onOpenAutoFocus',
    ]) as unknown as React.ComponentProps<'div'>;

    const hotKeyCallback = useCallback(
      (keyboardEvent: KeyboardEvent) => {
        handleClose();
        onEscapeKeyDown?.(keyboardEvent);
      },
      [handleClose, onEscapeKeyDown],
    );

    useHotkeys('Escape', hotKeyCallback, { enabled: isVisible, enableOnFormTags: true });

    return (
      <FocusScope loop trapped>
        <div
          {...filteredProps}
          data-state={dataState}
          ref={(node) => {
            contentRef.current = node;
            if (typeof ref === 'function') {
              ref(node);
            } else if (ref) {
              // eslint-disable-next-line no-param-reassign
              ref.current = node;
            }
          }}
        >
          {children}
        </div>
      </FocusScope>
    );
  },
);

FakeContentContent.displayName = 'FakeContentContent';

const FakeContentClose = ({ children, ...props }: Dialog.DialogCloseProps) => {
  const { handleClose } = useFakeContentModal();

  /**
   * Inject handleClose into children to ensure proper animation state management
   * and call the developer-provided onClose callback.
   */
  const filteredProps = omit(props, ['onClick']) as unknown as React.ComponentProps<'div'>;

  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) return React.cloneElement(child, { onClick: handleClose });
    return child;
  });

  return <div {...filteredProps}>{childrenWithProps}</div>;
};

export {
  FakeContentRoot,
  FakeContentPortal,
  FakeContentOverlay,
  FakeContentContent,
  FakeContentClose,
};
