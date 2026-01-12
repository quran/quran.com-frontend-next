/**
 * Merges multiple React refs into a single ref callback.
 * Useful when you need to forward a ref while also maintaining an internal ref.
 *
 * @template T - The type of the element being referenced
 * @param {...React.Ref<T>} refs - Array of refs to merge (can be function refs, ref objects, or null/undefined)
 * @returns {(node: T | null) => void} A callback function that updates all provided refs
 *
 * @example
 * const internalRef = useRef<HTMLDivElement>(null);
 * const forwardedRef = useRef<HTMLDivElement>(null);
 *
 * <div ref={mergeRefs(internalRef, forwardedRef)} />
 */
const mergeRefs = <T>(...refs: React.Ref<T>[]): ((node: T | null) => void) => {
  return (node: T | null) => {
    refs.forEach((ref) => {
      if (!ref) return;
      if (typeof ref === 'function') {
        ref(node);
      } else {
        // Intentional: React refs are mutable by design and require updating `.current`.
        // eslint-disable-next-line no-param-reassign
        (ref as React.MutableRefObject<T | null>).current = node;
      }
    });
  };
};

export default mergeRefs;
