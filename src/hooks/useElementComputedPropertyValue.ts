import React from 'react';

/**
 * A hook that gets the property value of the computed style of a specific element.
 *
 * @param {React.RefObject<HTMLElement>} ref
 * @param {string} property
 */
const useElementComputedPropertyValue = (ref: React.RefObject<HTMLElement>, property: string) => {
  if (typeof window !== 'undefined' && ref.current) {
    return window.getComputedStyle(ref.current).getPropertyValue(property);
  }
  return null;
};

export default useElementComputedPropertyValue;
