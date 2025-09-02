import { useEffect, useRef } from 'react';

/**
 * useHasMounted is a React hook that returns true after the component has mounted (client-side).
 * Useful for avoiding SSR/CSR mismatches and focusing components on their intention.
 * @returns {boolean} True if the component has mounted, false otherwise.
 */
export default function useHasMounted(): boolean {
  const hasMounted = useRef(false);

  useEffect(() => {
    hasMounted.current = true;
  }, []);

  return hasMounted.current;
}
