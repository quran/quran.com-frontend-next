import { useEffect, useRef } from 'react';

const DEFAULT_SCROLL_MARGIN = 300;

const useScrollTo = (
  scrollAbleParentMapper = (node) => node.parentNode,
  scrollMargin: number = DEFAULT_SCROLL_MARGIN,
) => {
  const selectedItemRef = useRef(null);
  useEffect(() => {
    if (selectedItemRef.current) {
      const scrollAbleParentNode = scrollAbleParentMapper(selectedItemRef.current);
      scrollAbleParentNode.scrollTo(0, selectedItemRef.current.offsetTop - scrollMargin);
    }
  }, [selectedItemRef, scrollMargin, scrollAbleParentMapper]);

  return selectedItemRef;
};

export default useScrollTo;
