import React, { useEffect } from 'react';

type Options = {
  maxWidth?: number;
};

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
  options?: Options,
) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      // do not trigger, if maxWidth is specificed
      if (options?.maxWidth && document.documentElement.clientWidth > options.maxWidth) return;

      // if we click on an element inside the document that is not an inclusive descendant of the ref node.
      if (ref.current && !ref.current.contains(event.target)) {
        onClickOutsideDetected();
      }
    };
    // no need to attach the listener if the parent component's visibility is controlled.
    if (enableDetection) {
      // Bind the event listener
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, onClickOutsideDetected, enableDetection, options?.maxWidth]);
};

export default useOutsideClickDetector;
