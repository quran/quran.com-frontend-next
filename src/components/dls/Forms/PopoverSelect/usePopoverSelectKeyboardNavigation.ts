import { useCallback } from 'react';

import type { PopoverSelectOption } from './index';

interface UsePopoverSelectKeyboardNavigationProps {
  disabled: boolean;
  isOpen: boolean;
  options: PopoverSelectOption[];
  highlightedIndex: number;
  setIsOpen: (isOpen: boolean) => void;
  setHighlightedIndex: (index: number) => void;
  handleSelect: (value: string | number) => void;
}

const usePopoverSelectKeyboardNavigation = ({
  disabled,
  isOpen,
  options,
  highlightedIndex,
  setIsOpen,
  setHighlightedIndex,
  handleSelect,
}: UsePopoverSelectKeyboardNavigationProps) => {
  const getNextEnabledIndex = useCallback(
    (currentIndex: number, direction: 'up' | 'down'): number => {
      if (options.length === 0) return currentIndex;

      let nextIndex = currentIndex;
      const step = direction === 'down' ? 1 : -1;
      const startIndex = direction === 'down' ? 0 : options.length - 1;
      let iterations = 0;

      do {
        nextIndex = nextIndex === -1 ? startIndex : nextIndex + step;
        if (nextIndex < 0) nextIndex = options.length - 1;
        if (nextIndex >= options.length) nextIndex = 0;
        if (!options[nextIndex].disabled) return nextIndex;
        iterations += 1;
      } while (iterations < options.length);

      return currentIndex;
    },
    [options],
  );

  const handleArrowDown = useCallback(
    (e: React.KeyboardEvent) => {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        setHighlightedIndex(getNextEnabledIndex(highlightedIndex, 'down'));
      }
    },
    [isOpen, highlightedIndex, setIsOpen, setHighlightedIndex, getNextEnabledIndex],
  );

  const handleArrowUp = useCallback(
    (e: React.KeyboardEvent) => {
      e.preventDefault();
      if (isOpen) {
        setHighlightedIndex(getNextEnabledIndex(highlightedIndex, 'up'));
      }
    },
    [isOpen, highlightedIndex, setHighlightedIndex, getNextEnabledIndex],
  );

  const handleEnterOrSpace = useCallback(
    (e: React.KeyboardEvent) => {
      e.preventDefault();
      if (isOpen && highlightedIndex >= 0 && highlightedIndex < options.length) {
        const option = options[highlightedIndex];
        if (option && !option.disabled) handleSelect(option.value);
      } else {
        setIsOpen(true);
      }
    },
    [isOpen, highlightedIndex, options, handleSelect, setIsOpen],
  );

  const handleEscape = useCallback(
    (e: React.KeyboardEvent) => {
      e.preventDefault();
      setIsOpen(false);
    },
    [setIsOpen],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;

      switch (e.key) {
        case 'ArrowDown':
          handleArrowDown(e);
          break;
        case 'ArrowUp':
          handleArrowUp(e);
          break;
        case 'Enter':
        case ' ':
          handleEnterOrSpace(e);
          break;
        case 'Escape':
          handleEscape(e);
          break;
        default:
          break;
      }
    },
    [disabled, handleArrowDown, handleArrowUp, handleEnterOrSpace, handleEscape],
  );

  return { handleKeyDown };
};

export default usePopoverSelectKeyboardNavigation;
