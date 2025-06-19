import { useState, useEffect } from 'react';

/**
 * A hook that returns whether the code is running on the client or not.
 * Useful for avoiding hydration mismatches in Next.js when using client-side only code.
 *
 * @returns {boolean} True if the code is running on the client, false otherwise
 */
const useIsClient = (): boolean => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
};

export default useIsClient;
