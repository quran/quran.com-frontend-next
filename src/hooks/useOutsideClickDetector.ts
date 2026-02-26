import React, { useEffect } from 'react';

/**
 * A hook that detects clicking outside an element.
 *
 * @param {React.RefObject<HTMLElement>} ref
 * @param {()=> void} onClickOutsideDetected
 * @param {boolean} enableDetection
 */
const useOutsideClickDetector = (
  ref: React.RefObject<HTMLElement>,
  onClickOutsideDetected: () => void,
  enableDetection: boolean,
  preventDefault: boolean = false,
) => {
  useEffect(() => {
    if (!enableDetection) return () => {};

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && event.target instanceof Node && !ref.current.contains(event.target)) {
        if (preventDefault) {
          event.preventDefault();
          event.stopPropagation();
        }
        onClickOutsideDetected();
      }
    };

    document.addEventListener('click', handleClickOutside, true);

    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, [ref, onClickOutsideDetected, enableDetection, preventDefault]);
};

export default useOutsideClickDetector;
