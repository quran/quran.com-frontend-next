import { useEffect, useState } from 'react';

/**
 * useHasMounted is a React hook that returns true after the component has mounted (client-side).
 * Useful for avoiding SSR/CSR mismatches and focusing components on their intention.
 * @returns {boolean} True if the component has mounted, false otherwise.
 */
const useHasMounted = (): boolean => {
  const [hasMounted, setHasMounted] = useState<boolean>(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return hasMounted;
};

export default useHasMounted;
